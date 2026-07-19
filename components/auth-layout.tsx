import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/15 via-transparent to-secondary-container/10 pointer-events-none" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-on-primary">
            <Icon name="school" filled />
          </div>
          <span className="font-semibold text-lg text-on-surface tracking-tight">CSS Aspirant</span>
        </Link>

        <Card className="p-8">
          <h1 className="text-xl font-bold text-on-surface text-center">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-on-surface-variant text-center">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
        </Card>
      </div>
    </div>
  );
}

export function TextField({
  label,
  type = "text",
  placeholder,
  id,
  value,
  onChange,
  required,
  minLength,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  id: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-on-surface mb-1.5">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className="w-full h-11 rounded-lg border border-outline-variant bg-surface-container-low px-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
      />
    </div>
  );
}

export function GoogleButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 rounded-full border border-outline-variant flex items-center justify-center gap-2 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
      </svg>
      {label}
    </button>
  );
}