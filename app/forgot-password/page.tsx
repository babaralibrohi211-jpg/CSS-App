"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout, TextField } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAuth, friendlyAuthError } from "@/lib/auth-context";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/15 text-primary mb-4">
            <Icon name="mark_email_read" filled className="text-[28px]" />
          </div>
          <p className="text-sm text-on-surface-variant">
            If an account exists for that email, we&apos;ve sent a link to reset your password.
          </p>
          <Link href="/login" className="inline-block mt-6">
            <Button variant="outline">Back to Sign In</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link.">
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

        {error && (
          <p className="text-sm text-error bg-error/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Remembered your password?{" "}
        <Link href="/login" className="text-primary font-medium">Sign In</Link>
      </p>
    </AuthLayout>
  );
}