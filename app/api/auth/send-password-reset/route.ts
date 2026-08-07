import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendPasswordResetEmailTo } from "@/lib/authEmailService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/send-password-reset
 * Body: { "email": "user@example.com" }
 * Public endpoint (the user forgot their password, so no session exists).
 * ALWAYS returns the same success message whether or not the account
 * exists — prevents email enumeration.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // Rate limit by IP AND by target email (2 layers of abuse prevention).
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const [ipLimit, emailLimit] = await Promise.all([
      checkRateLimit(`reset-ip:${ip}`, { maxRequests: 10, windowSeconds: 60 * 60 }),
      checkRateLimit(`reset-email:${email}`, { maxRequests: 3, windowSeconds: 30 * 60 }),
    ]);

    if (!ipLimit.allowed || !emailLimit.allowed) {
      const retry = Math.max(ipLimit.retryAfterSeconds ?? 0, emailLimit.retryAfterSeconds ?? 60);
      return NextResponse.json(
        { error: "Too many reset requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retry) } }
      );
    }

    await sendPasswordResetEmailTo(email);

    // Identical response for existing and non-existing accounts.
    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (err) {
    console.error("[send-password-reset]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to send reset email. Please try again." }, { status: 500 });
  }
}
