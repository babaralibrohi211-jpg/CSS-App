import { BRAND } from "./brand";

export interface EmailLayoutOptions {
  /** Hidden preview text shown next to the subject in inboxes. */
  preheader: string;
  /** Inner HTML of the card body (heading, copy, CTA, etc.). */
  bodyHtml: string;
}

/**
 * Wraps email content in the CSS Aspirants branded shell.
 * Table-based layout with inline styles for maximum client support
 * (Gmail, Outlook, Apple Mail, mobile clients).
 */
export function renderEmailLayout({ preheader, bodyHtml }: EmailLayoutOptions): string {
  const c = BRAND.colors;
  const year = new Date().getFullYear();

  const logo = BRAND.logoUrl
    ? `<img src="${BRAND.logoUrl}" alt="${BRAND.appName}" width="180" style="display:block;max-width:180px;height:auto;border:0;" />`
    : `<span style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;color:#FFFFFF;letter-spacing:0.5px;">${BRAND.appName}</span>`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${BRAND.appName}</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .cta-button { padding: 14px 32px !important; }
  </style>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; }
      .card { border-radius: 0 !important; }
      .content-pad { padding: 28px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${c.background};-webkit-text-size-adjust:100%;">
  <!-- Preheader (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${c.background};">
    ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${c.background};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

          <!-- Header -->
          <tr>
            <td class="card" style="background-color:${c.primary};background-image:linear-gradient(135deg,${c.primary},${c.primaryDark});border-radius:12px 12px 0 0;padding:28px 32px;" align="center">
              ${logo}
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#D9E5DF;letter-spacing:1.5px;text-transform:uppercase;margin-top:8px;">
                ${BRAND.tagline}
              </div>
            </td>
          </tr>

          <!-- Gold accent rule -->
          <tr><td style="height:4px;background-color:${c.accent};font-size:0;line-height:0;">&nbsp;</td></tr>

          <!-- Body -->
          <tr>
            <td class="card content-pad" style="background-color:${c.card};padding:36px 40px;border:1px solid ${c.border};border-top:0;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="card" style="background-color:${c.card};border:1px solid ${c.border};border-top:0;border-radius:0 0 12px 12px;padding:24px 40px 28px;" align="center">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:${c.footerText};">
                You are receiving this email because an action was requested for your ${BRAND.appName} account.<br />
                Need help? Contact <a href="mailto:${BRAND.supportEmail}" style="color:${c.primary};text-decoration:none;">${BRAND.supportEmail}</a><br /><br />
                &copy; ${year} ${BRAND.copyrightHolder}. All rights reserved.<br />
                <a href="${BRAND.siteUrl}" style="color:${c.footerText};text-decoration:underline;">${BRAND.siteUrl.replace(/^https?:\/\//, "")}</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Branded CTA button (bulletproof for Outlook via padded td). */
export function ctaButton(label: string, href: string): string {
  const c = BRAND.colors;
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto;">
    <tr>
      <td class="cta-button" align="center" style="background-color:${c.primary};border-radius:8px;">
        <a href="${href}" target="_blank"
           style="display:inline-block;padding:14px 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:8px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

/** Muted security note block. */
export function securityNote(html: string): string {
  const c = BRAND.colors;
  return `
  <div style="margin-top:24px;padding:14px 16px;background-color:#F7F9F8;border-left:3px solid ${c.accent};border-radius:0 6px 6px 0;">
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;line-height:1.7;color:${c.muted};">
      ${html}
    </p>
  </div>`;
}
