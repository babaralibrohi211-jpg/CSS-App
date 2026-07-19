"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Icon } from "@/components/ui/icon";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className={className} style={{ width: 36, height: 36 }} />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={
        className ??
        "flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container cursor-pointer"
      }
    >
      <Icon name={isDark ? "light_mode" : "dark_mode"} />
    </button>
  );
}
