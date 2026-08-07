import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendVerificationEmailTo } from "@/lib/authEmailService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/send-verification
 * Auth: Authorization: Bearer <Firebase ID token>
 * Sends the branded verification email to the CALLER's own address only.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Validate the caller's Firebase ID token.
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Invalid or expired session. Please sign in again." }, { status: 401 });
    }

    // 2. Rate limit: max 3 verification emails per user per 15 minutes.
    const limit = await checkRateLimit(`verify:${decoded.uid}`, {
      maxRequests: 3,
      windowSeconds: 15 * 60,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${Math.ceil((limit.retryAfterSeconds ?? 60) / 60)} minute(s).` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
      );
    }

    // 3. Generate link + send branded email.
    await sendVerificationEmailTo(decoded.uid);

    return NextResponse.json({ ok: true, message: "Verification email sent." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send verification email.";
    // "Already verified" is a client-fixable state, not a server error.
    const status = message.includes("already verified") ? 400 : 500;
    console.error("[send-verification]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
