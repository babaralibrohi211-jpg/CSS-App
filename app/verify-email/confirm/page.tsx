"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type Status = "verifying" | "success" | "error";

function VerifyEmailConfirmInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const oobCode = params.get("oobCode");
    if (!oobCode) {
      setStatus("error");
      setErrorMsg("This verification link is incomplete. Please use the link from your email.");
      return;
    }

    applyActionCode(auth, oobCode)
      .then(async () => {
        // Refresh local user so emailVerified updates without re-login.
        await auth.currentUser?.reload().catch(() => {});
        setStatus("success");
      })
      .catch((err: { code?: string }) => {
        setStatus("error");
        setErrorMsg(
          err?.code === "auth/expired-action-code"
            ? "This verification link has expired. Sign in and use \u201cResend verification email\u201d to get a new one."
            : err?.code === "auth/invalid-action-code"
            ? "This link is invalid or was already used. If you already verified, just sign in."
            : "We couldn't verify your email. Please try again or request a new link."
        );
      });
  }, [params]);

  function handleContinue() {
    // Signed in (e.g. opened in the same browser) → straight to onboarding;
    // otherwise → sign in first.
    router.push(auth.currentUser ? "/onboarding" : "/login");
  }

  if (status === "verifying") {
    return (
      <AuthLayout title="Verifying your email">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/15 text-primary mb-4">
            <Icon name="hourglass_top" filled className="text-[28px] animate-pulse" />
          </div>
          <p className="text-sm text-on-surface-variant">This only takes a moment…</p>
        </div>
      </AuthLayout>
    );
  }

  if (status === "success") {
    return (
      <AuthLayout title="Email verified!">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/15 text-primary mb-4">
            <Icon name="verified" filled className="text-[28px]" />
          </div>
          <p className="text-sm text-on-surface-variant">
            Your CSS Aspirants account is now fully active. Welcome aboard!
          </p>
          <Button className="w-full mt-6" size="lg" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verification failed">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error mb-4">
          <Icon name="error" filled className="text-[28px]" />
        </div>
        <p className="text-sm text-error bg-error/10 rounded-lg px-3 py-2">{errorMsg}</p>
        <Link href="/login" className="inline-block mt-6">
          <Button variant="outline">Back to Sign In</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailConfirmPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailConfirmInner />
    </Suspense>
  );
}
