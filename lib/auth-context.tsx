"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  requestVerificationEmail,
  requestPasswordResetEmail,
} from "@/lib/authEmailClient";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Error carrying a user-facing message from the custom email API. */
function emailApiError(message: string): Error & { code: string } {
  const err = new Error(message) as Error & { code: string };
  err.code = "custom/email-api";
  return err;
}

async function ensureUserDocument(user: User, name?: string) {
  const userRef = doc(db, "users", user.uid);
  const existing = await getDoc(userRef);
  if (!existing.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: name ?? user.displayName ?? "",
      email: user.email,
      authProvider: user.providerData[0]?.providerId ?? "password",
      subscriptionTier: "starter",
      trialStartDate: serverTimestamp(),
      onboarding: {
        completed: false,
        targetYear: null,
        dailyHours: null,
        level: null,
        completedSubjects: [],
        schedulePref: null,
      },
      readinessScore: 0,
      streakCount: 0,
      lastActiveDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signUp(name: string, email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    await ensureUserDocument(credential.user, name);

    // Branded verification email via our API (replaces sendEmailVerification).
    // The account is already created at this point, so a send failure is
    // reported as a recoverable message — the user can use "Resend".
    const result = await requestVerificationEmail();
    if (!result.ok) {
      throw emailApiError(
        "Your account was created, but we couldn't send the verification email. " +
          "Please use \u201cResend verification email\u201d in a moment."
      );
    }
  }

  async function logIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    await ensureUserDocument(credential.user);
  }

  async function logOut() {
    await firebaseSignOut(auth);
  }

  async function resetPassword(email: string) {
    // Branded reset email via our API (replaces firebase/auth sendPasswordResetEmail).
    const result = await requestPasswordResetEmail(email);
    if (!result.ok) throw emailApiError(result.message);
  }

  async function resendVerificationEmail() {
    if (auth.currentUser) {
      const result = await requestVerificationEmail();
      if (!result.ok) throw emailApiError(result.message);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, logIn, logInWithGoogle, logOut, resetPassword, resendVerificationEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";

  // Messages from our custom email API are already user-friendly.
  if (code === "custom/email-api") {
    return (error as Error).message;
  }

  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    default:
      return "Something went wrong. Please try again.";
  }
}
