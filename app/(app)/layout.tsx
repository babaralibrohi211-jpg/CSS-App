"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!user.emailVerified) {
      router.push("/verify-email");
    }
  }, [user, loading, router]);

  if (loading || !user || !user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}