/**
 * CSS Aspirants — email brand tokens.
 * Change values here once; every email updates automatically.
 */
export const BRAND = {
  appName: "CSS Aspirants",
  tagline: "Your companion for the Central Superior Services journey",

  // Set to your hosted logo (PNG, ~240px wide, transparent bg).
  // Leave empty ("") to fall back to a styled text logo.
  logoUrl: "https://YOUR_DOMAIN.com/logo-email.png",

  // Primary theme — deep green with a gold accent.
  colors: {
    primary: "#0B5D3B",       // deep green — headers, CTA button
    primaryDark: "#07452B",   // CTA hover / gradient end
    accent: "#C9A227",        // gold — thin accent rule
    text: "#1F2937",          // body text
    muted: "#6B7280",         // secondary text
    background: "#F3F5F4",    // page background
    card: "#FFFFFF",          // email card
    border: "#E5E7EB",
    footerText: "#9CA3AF",
  },

  // Used in footers and security notes.
  siteUrl: "https://YOUR_DOMAIN.com",
  supportEmail: "support@YOUR_DOMAIN.com",

  // Resend "from" — must be on a domain you verified in Resend.
  fromAddress: "CSS Aspirants <no-reply@yourdomain.com>",

  copyrightHolder: "CSS Aspirants",
} as const;
