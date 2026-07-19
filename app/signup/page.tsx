"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout, TextField, GoogleButton } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { useAuth, friendlyAuthError } from "@/lib/auth-context";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, logInWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!agreed) {
      setError("Please agree to the Terms and Privacy Policy to continue.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(name, email, password);
      router.push("/verify-email");
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
      router.push("/onboarding");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start your 7-day AI Mentor trial, free.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField
          id="name"
          label="Full name"
          placeholder="e.g. Ayesha Khan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <label className="flex items-start gap-2 text-xs text-on-surface-variant">
          <input
            type="checkbox"
            className="mt-0.5 accent-[color:var(--primary)]"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          I agree to the{" "}
          <Link href="/terms" className="text-primary font-medium">Terms</Link> and{" "}
          <Link href="/privacy" className="text-primary font-medium">Privacy Policy</Link>
        </label>

        {error && (
          <p className="text-sm text-error bg-error/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Creating account..." : "Create Account"}
        </Button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-outline-variant/60" />
          <span className="text-xs text-on-surface-variant">or</span>
          <div className="h-px flex-1 bg-outline-variant/60" />
        </div>

        <GoogleButton label="Sign up with Google" onClick={handleGoogle} disabled={submitting} />
      </form>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium">Sign In</Link>
      </p>
    </AuthLayout>
  );
}