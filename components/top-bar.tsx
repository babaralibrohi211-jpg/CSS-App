"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/command-palette";
import { mobileTabNav, primaryNav } from "@/lib/nav";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export function TopBar() {
  const { user } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const extraMobileItems = primaryNav.filter(
    (item) => !mobileTabNav.some((m) => m.href === item.href)
  );

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "notifications"), where("uid", "==", user.uid), where("read", "==", false))
        );
        setHasUnread(!snap.empty);
      } catch (err) {
        console.error("Failed to check notifications:", err);
      }
    })();
  }, [user]);

  const avatarInitial = (user?.displayName?.[0] || user?.email?.[0] || "?").toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-outline-variant/40 bg-surface/90 backdrop-blur px-4 md:px-6">
        <button
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Icon name="menu" />
        </button>

        <button
          onClick={() => setPaletteOpen(true)}
          className="flex flex-1 max-w-md items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-low px-4 h-10 text-sm text-on-surface-variant hover:bg-surface-container cursor-pointer"
        >
          <Icon name="search" className="text-[18px]" />
          <span className="hidden sm:inline">Search subjects, notes, papers...</span>
          <span className="sm:hidden">Search...</span>
          <kbd className="hidden sm:inline-flex ml-auto items-center rounded border border-outline-variant px-1.5 py-0.5 text-[10px] text-on-surface-variant">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container relative"
          >
            <Icon name="notifications" />
            {hasUnread && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-error" />}
          </Link>
          <ThemeToggle />
          <Link
            href="/account/settings"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container text-sm font-semibold"
          >
            {avatarInitial}
          </Link>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="relative w-72 max-w-[80%] bg-surface-container-lowest h-full p-4 flex flex-col gap-1 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-lg">CSS Aspirant</span>
              <button onClick={() => setMenuOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container">
                <Icon name="close" />
              </button>
            </div>
            {extraMobileItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container"
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            ))}
            <Link
              href="/exam-timeline"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container"
            >
              <Icon name="event" />
              Exam Timeline
            </Link>
            <Link
              href="/achievements"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container"
            >
              <Icon name="military_tech" />
              Achievements
            </Link>
            <div className="mt-auto pt-3 border-t border-outline-variant/40">
              <Link
                href="/pricing"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-tertiary hover:bg-tertiary-container/10"
              >
                <Icon name="workspace_premium" filled />
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}