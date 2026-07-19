"use client";

import { useState } from "react";
import { Card, Badge } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { bookmarks } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const TYPES = ["All", "Notes", "Books", "Questions", "AI Responses", "Topics"];

export default function BookmarksPage() {
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState(bookmarks);

  const filtered = filter === "All" ? items : items.filter((b) => b.type === filter);

  function remove(id: number) {
    setItems((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Bookmarks</h1>
        <p className="text-sm text-on-surface-variant mt-1">Everything you've saved for later, in one place.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors",
              filter === t
                ? "bg-primary text-on-primary border-primary"
                : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <Icon name="bookmark_border" className="text-[32px] text-on-surface-variant mb-2" />
          <p className="text-sm text-on-surface-variant">No bookmarks in this category yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((b) => (
            <Card key={b.id} className="p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Badge tone="secondary">{b.type}</Badge>
                <p className="mt-2 text-sm font-medium text-on-surface leading-snug">{b.title}</p>
                <p className="mt-1 text-xs text-on-surface-variant">{b.subject} · {b.date}</p>
              </div>
              <button
                onClick={() => remove(b.id)}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-error"
                aria-label="Remove bookmark"
              >
                <Icon name="bookmark" filled className="text-[18px]" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}