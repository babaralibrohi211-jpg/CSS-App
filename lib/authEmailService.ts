import { adminAuth } from "@/lib/firebaseAdmin";
import { sendEmail } from "@/lib/resendMailer";
import {
  renderVerificationEmail,
  renderVerificationEmailText,
  verificationEmailSubject,
} from "@/lib/emails/verificationEmail";
import {
  renderPasswordResetEmail,
  renderPasswordResetEmailText,
  passwordResetEmailSubject,
} from "@/lib/emails/passwordResetEmail";

/**
 * Core email service — link generation + sending. SERVER ONLY.
 *
 * NOTE: This version does NOT require the "Customize action URL" setting
 * in the Firebase Console. The Admin SDK's generated link contains the
 * one-time oobCode as a query parameter; we extract it and build a link
 * straight to our own /verify-email and /reset-password pages, where the
 * client SDK (applyActionCode / confirmPasswordReset) consumes the code.
 */
function buildDirectActionUrl(generatedLink: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (!base) throw new Error("Missing NEXT_PUBLIC_APP_URL environment variable.");

  const oobCode = new URL(generatedLink).searchParams.get("oobCode");
  if (!oobCode) throw new Error("Could not extract action code from Firebase link.");

  return `${base}${path}?oobCode=${encodeURIComponent(oobCode)}`;
}

/** Generate a verification link and send the branded email (authenticated uid). */
export async function sendVerificationEmailTo(uid: string): Promise<void> {
  const user = await adminAuth.getUser(uid);

  if (!user.email) throw new Error("Account has no email address.");
  if (user.emailVerified) throw new Error("Email is already verified.");

  // No actionCodeSettings — avoids any authorized-domain requirement.
  const firebaseLink = await adminAuth.generateEmailVerificationLink(user.email);
  const link = buildDirectActionUrl(firebaseLink, "/verify-email/confirm");

  await sendEmail({
    to: user.email,
    subject: verificationEmailSubject(),
    html: renderVerificationEmail({ displayName: user.displayName, verificationLink: link }),
    text: renderVerificationEmailText({ displayName: user.displayName, verificationLink: link }),
  });
}

/**
 * Generate a reset link and send the branded email.
 * Never reveals whether the account exists (anti-enumeration):
 * unknown emails and Google-only accounts resolve silently.
 */
export async function sendPasswordResetEmailTo(email: string): Promise<void> {
  let user;
  try {
    user = await adminAuth.getUserByEmail(email);
  } catch {
    return;
  }

  const hasPasswordProvider = user.providerData.some((p) => p.providerId === "password");
  if (!hasPasswordProvider) return;

  const firebaseLink = await adminAuth.generatePasswordResetLink(email);
  const link = buildDirectActionUrl(firebaseLink, "/reset-password");

  await sendEmail({
    to: email,
    subject: passwordResetEmailSubject(),
    html: renderPasswordResetEmail({ displayName: user.displayName, resetLink: link }),
    text: renderPasswordResetEmailText({ displayName: user.displayName, resetLink: link }),
  });
}
