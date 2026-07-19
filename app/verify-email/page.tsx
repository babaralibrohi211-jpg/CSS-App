"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, resendVerificationEmail, logOut } = useAuth();
  const [resent, setResent] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          router.push("/onboarding");
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [router]);

  async function handleResend() {
    await resendVerificationEmail();
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  }

  async function handleCheckNow() {
    setChecking(true);
    if (auth.currentUser) {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        router.push("/onboarding");
        return;
      }
    }
    setChecking(false);
  }

  return (
    <AuthLayout title="Verify your email" subtitle="One quick step before you get started.">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/15 text-primary mb-4">
          <Icon name="mark_email_unread" filled className="text-[28px]" />
        </div>
        <p className="text-sm text-on-surface-variant">
          We&apos;ve sent a verification link to{" "}
          <span className="font-medium text-on-surface">{user?.email}</span>. Click it, then
          come back here — this page will move on automatically.
        </p>

        <Button className="w-full mt-6" size="lg" onClick={handleCheckNow} disabled={checking}>
          {checking ? "Checking..." : "I've verified — Continue"}
        </Button>

        <button
          type="button"
          onClick={handleResend}
          className="mt-4 text-sm text-primary font-medium cursor-pointer disabled:opacity-50"
          disabled={resent}
        >
          {resent ? "Verification email sent" : "Resend verification email"}
        </button>

        <div className="mt-8 pt-6 border-t border-outline-variant/60">
          <button
            type="button"
            onClick={() => logOut().then(() => router.push("/login"))}
            className="text-sm text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            Sign out and use a different account
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}