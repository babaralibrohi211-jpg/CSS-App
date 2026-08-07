"use client";

import { auth } from "@/lib/firebase";

/**
 * Frontend API layer for the custom branded email system.
 * Called only from auth-context.tsx — the rest of the app keeps
 * using useAuth() exactly as before.
 */

export interface EmailApiResult {
  ok: boolean;
  message: string;
}

async function postWithRetry(
  url: string,
  init: RequestInit,
  retries = 1
): Promise<EmailApiResult> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, init);
      const data = await res.json().catch(() => ({}));

      if (res.ok) return { ok: true, message: data.message ?? "Email sent." };

      // 4xx (incl. 429 rate limits) won't change on retry — surface directly.
      if (res.status < 500 || attempt >= retries) {
        return { ok: false, message: data.error ?? "Something went wrong. Please try again." };
      }
    } catch {
      if (attempt >= retries) {
        return { ok: false, message: "Network error. Check your connection and try again." };
      }
    }
    await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
  }
}

/** Send the branded verification email to the signed-in user. */
export async function requestVerificationEmail(): Promise<EmailApiResult> {
  const user = auth.currentUser;
  if (!user) return { ok: false, message: "You must be signed in." };

  const idToken = await user.getIdToken();
  return postWithRetry("/api/auth/send-verification", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });
}

/** Send the branded password-reset email. */
export async function requestPasswordResetEmail(email: string): Promise<EmailApiResult> {
  return postWithRetry("/api/auth/send-password-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}
