"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";

const RECENT = ["Pakistan Affairs syllabus", "2023 English Essay paper", "Precis writing notes"];

const RESULT_GROUPS = [
  {
    label: "Subjects",
    items: [
      { title: "Pakistan Affairs", href: "/subjects/pakistan-affairs" },
      { title: "English Essay", href: "/subjects/english-essay" },
    ],
  },
  {
    label: "Past Papers",
    items: [{ title: "English Precis & Composition — 2023", href: "/subjects/english-precis" }],
  },
  {
    label: "Notes",
    items: [{ title: "Precis Writing — Core Techniques", href: "/subjects/english-precis" }],
  },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose();
        document.dispatchEvent(new Event("toggle-palette"));
      }
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  const filtered = query
    ? RESULT_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase())),
      })).filter((g) => g.items.length > 0)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-xl bg-surface-container-lowest shadow-2xl border border-outline-variant/40 overflow-hidden">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-outline-variant/40">
          <Icon name="search" className="text-on-surface-variant" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, books, past papers, questions, notes..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-on-surface-variant"
          />
          <kbd className="text-[10px] border border-outline-variant rounded px-1.5 py-0.5 text-on-surface-variant">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {!query && (
            <div className="px-2 py-2">
              <p className="text-xs font-medium text-on-surface-variant px-2 pb-1">Recent</p>
              {RECENT.map((r) => (
                <button
                  key={r}
                  onClick={() => setQuery(r)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-on-surface hover:bg-surface-container text-left"
                >
                  <Icon name="history" className="text-on-surface-variant text-[18px]" />
                  {r}
                </button>
              ))}
            </div>
          )}

          {query && filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-on-surface-variant">No results for &ldquo;{query}&rdquo;</p>
          )}

          {filtered.map((group) => (
            <div key={group.label} className="px-2 py-2">
              <p className="text-xs font-medium text-on-surface-variant px-2 pb-1">{group.label}</p>
              {group.items.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-on-surface hover:bg-surface-container text-left"
                >
                  <Icon name="north_east" className="text-on-surface-variant text-[18px]" />
                  {item.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
