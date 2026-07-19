import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant/40 bg-surface/90 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center h-16 px-4 md:px-6 gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-on-primary">
            <Icon name="school" filled />
          </div>
          <span className="font-semibold text-lg text-on-surface tracking-tight">CSS Aspirant</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-on-surface-variant ml-4">
          <Link href="/pricing" className="hover:text-on-surface">Pricing</Link>
          <Link href="/current-affairs" className="hover:text-on-surface">Current Affairs</Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/login" className="hidden sm:inline-flex items-center h-10 px-4 text-sm font-medium text-on-surface hover:text-primary">
            Sign In
          </Link>
          <Link href="/signup">
            <Button size="md">Get Started Free</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-outline-variant/40 mt-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row gap-8 md:items-center md:justify-between text-sm text-on-surface-variant">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-on-primary">
            <Icon name="school" filled className="text-[16px]" />
          </div>
          <span className="font-medium text-on-surface">CSS Aspirant</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/pricing" className="hover:text-on-surface">Pricing</Link>
          <Link href="/current-affairs" className="hover:text-on-surface">Current Affairs</Link>
          <Link href="/privacy" className="hover:text-on-surface">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-on-surface">Terms</Link>
          <Link href="/contact" className="hover:text-on-surface">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
