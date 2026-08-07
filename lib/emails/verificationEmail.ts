import { BRAND } from "./brand";
import { ctaButton, renderEmailLayout, securityNote } from "./layout";

export interface VerificationEmailProps {
  displayName?: string | null;
  verificationLink: string;
}

export function verificationEmailSubject(): string {
  return `Verify your email — ${BRAND.appName}`;
}

export function renderVerificationEmail({ displayName, verificationLink }: VerificationEmailProps): string {
  const c = BRAND.colors;
  const greetingName = displayName?.trim() ? displayName.trim() : "Aspirant";

  const bodyHtml = `
    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:${c.text};">
      Welcome aboard, ${greetingName}!
    </h1>
    <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:${c.text};">
      Thank you for joining <strong>${BRAND.appName}</strong> — we're glad to have you on your preparation journey.
      Please confirm your email address to activate your account and unlock all features.
    </p>

    ${ctaButton("Verify my email", verificationLink)}

    <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:${c.muted};">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;word-break:break-all;">
      <a href="${verificationLink}" style="color:${c.primary};">${verificationLink}</a>
    </p>

    ${securityNote(
      `<strong>Security note:</strong> this link expires shortly and can only be used once.
       If you didn't create a ${BRAND.appName} account, you can safely ignore this email — no account will be activated without verification.`
    )}
  `;

  return renderEmailLayout({
    preheader: `Confirm your email to activate your ${BRAND.appName} account.`,
    bodyHtml,
  });
}

/** Plain-text fallback (improves deliverability). */
export function renderVerificationEmailText({ displayName, verificationLink }: VerificationEmailProps): string {
  const name = displayName?.trim() || "Aspirant";
  return [
    `Welcome to ${BRAND.appName}, ${name}!`,
    ``,
    `Please verify your email address by opening this link:`,
    verificationLink,
    ``,
    `This link expires shortly and can only be used once.`,
    `If you didn't create an account, ignore this email.`,
    ``,
    `— The ${BRAND.appName} team`,
  ].join("\n");
}
