"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth-context";
import { getUserBookmarks, removeBookmarkById, Bookmark, BookmarkType } from "@/lib/bookmarks";

const FILTERS: { key: BookmarkType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "subject", label: "Subjects" },
  { key: "book", label: "Books" },
  { key: "note", label: "Notes" },
  { key: "pastPaper", label: "Past Papers" },
];

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filter, setFilter] = useState<BookmarkType | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await getUserBookmarks(user.uid);
        setBookmarks(data);
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function handleRemove(id: string) {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    try {
      await removeBookmarkById(id);
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    }
  }

  const filtered = filter === "all" ? bookmarks : bookmarks.filter((b) => b.itemType === filter);

  const typeIcon: Record<BookmarkType, string> = {
    subject: "menu_book",
    book: "menu_book",
    note: "description",
    pastPaper: "history_edu",
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Bookmarks</h1>
        <p className="text-sm text-on-surface-variant mt-1">Subjects, books, and notes you've saved.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-on-primary"
                : "border border-outline-variant text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 flex flex-col items-center text-center">
          <Icon name="bookmark" className="text-[40px] text-on-surface-variant/40 mb-3" />
          <p className="text-sm text-on-surface-variant">
            {bookmarks.length === 0
              ? "No bookmarks yet. Tap the bookmark icon on a subject, book, or note to save it here."
              : "No bookmarks in this category."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <Card key={b.id} className="p-4 flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container/15 text-primary">
                <Icon name={typeIcon[b.itemType]} />
              </div>
              <div className="min-w-0 flex-1">
                <Badge tone="secondary">{b.subjectName}</Badge>
                <Link href={b.linkUrl} target={b.linkUrl.startsWith("http") ? "_blank" : undefined}>
                  <p className="text-sm font-medium text-on-surface mt-1.5 hover:text-primary line-clamp-2">
                    {b.title}
                  </p>
                </Link>
              </div>
              <button
                onClick={() => handleRemove(b.id)}
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant"
                aria-label="Remove bookmark"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}