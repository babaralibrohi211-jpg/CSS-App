"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthLayout, TextField } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type Status = "checking" | "ready" | "saving" | "done" | "invalid";

function ResetPasswordInner() {
  const params = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const oobCode = params.get("oobCode") ?? "";

  // Validate the reset code before showing the form.
  useEffect(() => {
    if (!oobCode) {
      setStatus("invalid");
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((accountEmail) => {
        setEmail(accountEmail);
        setStatus("ready");
      })
      .catch(() => setStatus("invalid"));
  }, [oobCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setStatus("saving");
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus("done");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setStatus("ready");
      setError(
        code === "auth/expired-action-code" || code === "auth/invalid-action-code"
          ? "This reset link has expired or was already used. Please request a new one."
          : code === "auth/weak-password"
          ? "That password is too weak. Try a longer one."
          : "Couldn't reset your password. Please try again."
      );
    }
  }

  if (status === "checking") {
    return (
      <AuthLayout title="Reset your password">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/15 text-primary mb-4">
            <Icon name="hourglass_top" filled className="text-[28px] animate-pulse" />
          </div>
          <p className="text-sm text-on-surface-variant">Checking your reset link…</p>
        </div>
      </AuthLayout>
    );
  }

  if (status === "invalid") {
    return (
      <AuthLayout title="Link expired or invalid">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error mb-4">
            <Icon name="link_off" filled className="text-[28px]" />
          </div>
          <p className="text-sm text-on-surface-variant">
            Password reset links can only be used once. Request a new one below.
          </p>
          <Link href="/forgot-password" className="inline-block mt-6">
            <Button size="lg">Request a New Link</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (status === "done") {
    return (
      <AuthLayout title="Password updated">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/15 text-primary mb-4">
            <Icon name="check_circle" filled className="text-[28px]" />
          </div>
          <p className="text-sm text-on-surface-variant">
            You can now sign in with your new password. Redirecting you to Sign In…
          </p>
          <Link href="/login" className="inline-block mt-6">
            <Button variant="outline">Go Now</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={`Resetting the password for ${email}`}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField
          id="new-password"
          label="New password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          id="confirm-password"
          label="Confirm password"
          type="password"
          placeholder="Repeat your new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-error bg-error/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Reset Password"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Remembered your password?{" "}
        <Link href="/login" className="text-primary font-medium">Sign In</Link>
      </p>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}