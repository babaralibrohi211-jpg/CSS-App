import { BRAND } from "./brand";
import { ctaButton, renderEmailLayout, securityNote } from "./layout";

export interface PasswordResetEmailProps {
  displayName?: string | null;
  resetLink: string;
}

export function passwordResetEmailSubject(): string {
  return `Reset your password — ${BRAND.appName}`;
}

export function renderPasswordResetEmail({ displayName, resetLink }: PasswordResetEmailProps): string {
  const c = BRAND.colors;
  const greetingName = displayName?.trim() ? displayName.trim() : "there";

  const bodyHtml = `
    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:${c.text};">
      Password reset request
    </h1>
    <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:${c.text};">
      Hi ${greetingName}, we received a request to reset the password for your <strong>${BRAND.appName}</strong> account.
      Click the button below to choose a new password.
    </p>

    ${ctaButton("Reset my password", resetLink)}

    <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:${c.muted};">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;word-break:break-all;">
      <a href="${resetLink}" style="color:${c.primary};">${resetLink}</a>
    </p>

    ${securityNote(
      `<strong>Didn't request this?</strong> Your password remains unchanged and you can safely ignore this email.
       For your security, this link expires shortly and can only be used once. Never share it with anyone —
       the ${BRAND.appName} team will never ask you for it.`
    )}
  `;

  return renderEmailLayout({
    preheader: `Reset your ${BRAND.appName} password securely.`,
    bodyHtml,
  });
}

export function renderPasswordResetEmailText({ displayName, resetLink }: PasswordResetEmailProps): string {
  const name = displayName?.trim() || "there";
  return [
    `Hi ${name},`,
    ``,
    `We received a request to reset your ${BRAND.appName} password.`,
    `Open this link to choose a new password:`,
    resetLink,
    ``,
    `If you didn't request this, ignore this email — your password is unchanged.`,
    `The link expires shortly and can only be used once.`,
    ``,
    `— The ${BRAND.appName} team`,
  ].join("\n");
}
