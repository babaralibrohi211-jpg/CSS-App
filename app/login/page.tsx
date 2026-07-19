"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout, TextField, GoogleButton } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { useAuth, friendlyAuthError } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const { logIn, logInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await logIn(email, password);
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        router.push("/verify-email");
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setSubmitting(true);
    try {
      await logInWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your CSS preparation.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div>
          <TextField
            id="password"
            label="Password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end mt-1.5">
            <Link href="/forgot-password" className="text-xs text-primary font-medium">
              Forgot Password?
            </Link>
          </div>
        </div>

        {error && (
          <p className="text-sm text-error bg-error/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign In"}
        </Button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-outline-variant/60" />
          <span className="text-xs text-on-surface-variant">or</span>
          <div className="h-px flex-1 bg-outline-variant/60" />
        </div>

        <GoogleButton label="Sign in with Google" onClick={handleGoogle} disabled={submitting} />
      </form>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-medium">Sign Up</Link>
      </p>
    </AuthLayout>
  );
}