"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";

interface UserDoc {
  name?: string;
  email?: string;
  subscriptionTier?: string;
  onboarding?: {
    targetYear?: number | null;
    dailyHours?: number | null;
    level?: string | null;
    schedulePref?: string | null;
  };
}

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [profile, setProfile] = useState<UserDoc | null>(null);

  useEffect(() => setMounted(true), []);

  // Live-subscribe to this user's Firestore profile doc
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) setProfile(snap.data() as UserDoc);
    });
    return unsubscribe;
  }, [user]);

  const isDark = mounted && resolvedTheme === "dark";

  async function handleLogout() {
    await logOut();
    router.push("/login");
  }

  const displayName = profile?.name || user?.displayName || "";
  const displayEmail = profile?.email || user?.email || "";
  const tier = profile?.subscriptionTier
    ? profile.subscriptionTier.charAt(0).toUpperCase() + profile.subscriptionTier.slice(1)
    : "Starter";
  const targetYear = profile?.onboarding?.targetYear;
  const dailyHours = profile?.onboarding?.dailyHours;
  const level = profile?.onboarding?.level;
  const schedule = profile?.onboarding?.schedulePref;

  if (!profile) {
    return (
      <div className="max-w-2xl">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Account & Settings</h1>
      </div>

      {/* Profile header */}
      <Card className="p-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20 text-primary text-2xl font-semibold">
          {displayName ? displayName[0].toUpperCase() : "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-on-surface">{displayName || "Unnamed"}</p>
          <p className="text-sm text-on-surface-variant">{displayEmail}</p>
        </div>
        <Badge tone="tertiary">{tier} Plan</Badge>
      </Card>

      {/* Profile info */}
      <SettingsSection title="Profile Information">
        <Row label="Full name" value={displayName || "—"} />
        <Row label="Email" value={displayEmail || "—"} last />
      </SettingsSection>

      {/* Onboarding preferences */}
      <SettingsSection title="Onboarding Preferences">
        <Row label="Target attempt year" value={targetYear ? String(targetYear) : "Not set"} />
        <Row label="Daily study hours" value={dailyHours ? `${dailyHours} hrs/day` : "Not set"} />
        <Row label="Preparation level" value={level || "Not set"} />
        <Row label="Preferred schedule" value={schedule || "Not set"} last />
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection title="Preferences">
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-on-surface">Notification preferences</p>
            <p className="text-xs text-on-surface-variant">Email + browser reminders for planner tasks</p>
          </div>
          <Toggle checked={notifications} onChange={setNotifications} />
        </div>
        <div className="flex items-center justify-between py-3 border-t border-outline-variant/30">
          <div>
            <p className="text-sm font-medium text-on-surface">Dark mode</p>
            <p className="text-xs text-on-surface-variant">Switch between light and dark themes</p>
          </div>
          <Toggle checked={isDark} onChange={(v) => setTheme(v ? "dark" : "light")} />
        </div>
      </SettingsSection>

      {/* Links */}
      <Card className="p-2">
        <Link href="/privacy" className="flex items-center justify-between px-4 py-3 text-sm text-on-surface hover:bg-surface-container rounded-lg">
          Privacy Policy
          <Icon name="chevron_right" className="text-on-surface-variant" />
        </Link>
        <Link href="/terms" className="flex items-center justify-between px-4 py-3 text-sm text-on-surface hover:bg-surface-container rounded-lg">
          Terms of Service
          <Icon name="chevron_right" className="text-on-surface-variant" />
        </Link>
      </Card>

      {/* Log out */}
      <Card className="p-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-on-surface hover:bg-surface-container rounded-lg text-left cursor-pointer"
        >
          <Icon name="logout" />
          Log Out
        </button>
      </Card>

      {/* Danger zone */}
      <Card className="p-5 border-error-container bg-error-container/10">
        <p className="text-sm font-semibold text-error">Danger Zone</p>
        <p className="text-xs text-on-surface-variant mt-1">
          Deleting your account permanently removes all progress, bookmarks, and chat history.
        </p>
        <Button variant="outline" className="mt-3 border-error text-error hover:bg-error-container/20">
          Delete Account
        </Button>
      </Card>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="font-semibold text-on-surface mb-1">{title}</h2>
      <div className="divide-y divide-outline-variant/30">{children}</div>
    </Card>
  );
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 ${last ? "" : ""}`}>
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className="text-sm font-medium text-on-surface">{value}</span>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${checked ? "bg-primary" : "bg-surface-container-high"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`}
      />
    </button>
  );
}