import nodemailer from "nodemailer";
import { BRAND } from "@/lib/emails/brand";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends email through Gmail SMTP (free, no domain needed).
 * SERVER ONLY — called from API routes.
 *
 * Requires in .env.local (and later in Vercel):
 *   GMAIL_USER=your@gmail.com
 *   GMAIL_APP_PASSWORD=16-char app password (no spaces)
 *
 * NOTE: Gmail always sends from GMAIL_USER's address; the display
 * name "CSS Aspirants" comes from BRAND.fromAddress's name part.
 * When you buy a domain later, restore the Resend version of this
 * file — nothing else in the project needs to change.
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variable.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  // Display name from brand config; actual address must be the Gmail account.
  const nameMatch = BRAND.fromAddress.match(/^([^<]+)</);
  const displayName = nameMatch ? nameMatch[1].trim() : BRAND.appName;

  await transporter.sendMail({
    from: `${displayName} <${user}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}