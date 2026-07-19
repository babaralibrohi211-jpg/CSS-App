"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { mobileTabNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch justify-around border-t border-outline-variant/40 bg-surface-container-lowest/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      {mobileTabNav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
              active ? "text-primary" : "text-on-surface-variant"
            )}
          >
            <Icon name={item.icon} filled={active} className="text-[22px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
