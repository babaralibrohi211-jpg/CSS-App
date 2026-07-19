"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { primaryNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden md:flex md:flex-col shrink-0 border-r border-outline-variant/40 bg-surface-container-lowest",
        "md:w-[76px] lg:w-64 transition-all duration-200"
      )}
    >
      <div className="flex items-center gap-2 px-4 h-16 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-on-primary shrink-0">
          <Icon name="school" filled />
        </div>
        <span className="hidden lg:block font-semibold text-lg text-on-surface tracking-tight">
          CSS Aspirant
        </span>
      </div>

      <nav className="flex-1 px-2 lg:px-3 py-2 space-y-1 overflow-y-auto">
        {primaryNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors justify-center lg:justify-start",
                active
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container"
              )}
            >
              <Icon name={item.icon} filled={active} />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 lg:px-3 py-3 border-t border-outline-variant/40">
        <Link
          href="/pricing"
          className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-tertiary hover:bg-tertiary-container/10 justify-center lg:justify-start"
        >
          <Icon name="workspace_premium" filled />
          <span className="hidden lg:inline">Upgrade to Pro</span>
        </Link>
      </div>
    </aside>
  );
}
