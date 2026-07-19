"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, ProgressRing, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getSubjectDetail } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const TABS = ["Overview", "Syllabus", "Notes", "Books", "Past Papers", "Quiz", "AI Tutor"] as const;
type Tab = (typeof TABS)[number];

export default function SubjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const subject = getSubjectDetail(slug);
  const [tab, setTab] = useState<Tab>("Overview");
  const [bookmarked, setBookmarked] = useState(false);
  const [syllabus, setSyllabus] = useState(subject?.syllabus ?? []);

  if (!subject) return notFound();

  function toggleTopic(id: number) {
    setSyllabus((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-container/15 text-primary">
            <Icon name={subject.icon} filled className="text-[28px]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-on-surface">{subject.name}</h1>
              <Badge tone={subject.group === "Compulsory" ? "primary" : "secondary"}>{subject.group}</Badge>
            </div>
            <p className="text-sm text-on-surface-variant mt-1">{subject.progress}% complete</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBookmarked((b) => !b)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container"
            aria-label="Bookmark subject"
          >
            <Icon name="bookmark" filled={bookmarked} className={bookmarked ? "text-primary" : ""} />
          </button>
          <ProgressRing value={subject.progress} size={56} strokeWidth={6} label={`${subject.progress}%`} />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-outline-variant/40 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "Overview" && (
        <div className="space-y-5">
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">{subject.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Marks" value={String(subject.stats.totalMarks)} icon="workspace_premium" />
            <StatCard label="Questions" value={String(subject.stats.questions)} icon="quiz" />
            <StatCard label="Category" value={subject.stats.split} icon="category" />
            <StatCard label="Recommended Time" value={subject.stats.recommendedTime} icon="schedule" />
          </div>
        </div>
      )}

      {tab === "Syllabus" && (
        <Card className="divide-y divide-outline-variant/30">
          {syllabus.map((topic) => (
            <button
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left"
            >
              <Icon
                name={topic.done ? "check_circle" : "radio_button_unchecked"}
                filled={topic.done}
                className={topic.done ? "text-primary" : "text-on-surface-variant"}
              />
              <span className={cn("text-sm", topic.done ? "text-on-surface-variant line-through" : "text-on-surface")}>
                {topic.title}
              </span>
            </button>
          ))}
        </Card>
      )}

      {tab === "Notes" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {subject.notes.map((note) => (
            <Card key={note.title} className="p-5 hover:bg-surface-container-low transition-colors cursor-pointer">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Icon name="description" filled className="text-[18px]" />
                <span className="text-xs font-medium">Notes</span>
              </div>
              <h3 className="font-medium text-sm text-on-surface">{note.title}</h3>
              <p className="mt-1 text-xs text-on-surface-variant line-clamp-2">{note.preview}</p>
            </Card>
          ))}
        </div>
      )}

      {tab === "Books" && (
        <div className="space-y-6">
          {(["beginner", "intermediate", "advanced"] as const).map((level) => (
            <div key={level}>
              <h3 className="font-semibold text-on-surface mb-3 capitalize">{level}</h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {subject.books[level].map((book) => (
                  <Card key={book.title} className="p-4 flex gap-3">
                    <div className="h-16 w-12 shrink-0 rounded-md bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                      <Icon name="menu_book" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface leading-snug">{book.title}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{book.author}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Past Papers" && (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-tertiary mb-3">
              <Icon name="auto_awesome" filled className="text-[18px]" />
              <span className="text-sm font-semibold">Frequently Repeated Questions</span>
            </div>
            <ul className="space-y-2">
              {subject.frequentlyRepeated.map((q) => (
                <li key={q} className="text-sm text-on-surface-variant flex gap-2">
                  <span>•</span>
                  {q}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="divide-y divide-outline-variant/30">
            {subject.pastPapers.map((p) => (
              <div key={p.year} className="flex items-center justify-between px-5 py-4">
                <span className="text-sm font-medium text-on-surface">{p.year}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View Paper</Button>
                  {p.hasSolved && <Button variant="ghost" size="sm">View Solved</Button>}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab === "Quiz" && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {subject.quizzes.map((q) => (
            <Link key={q.title} href="/quizzes">
              <Card className="p-5 hover:bg-surface-container-low transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container mb-3">
                  <Icon name="quiz" filled className="text-[18px]" />
                </div>
                <h3 className="font-medium text-sm text-on-surface">{q.title}</h3>
                <p className="mt-1 text-xs text-on-surface-variant">{q.questions} questions · {q.minutes} min</p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {tab === "AI Tutor" && (
        <Card className="p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-container/15 text-primary">
              <Icon name="smart_toy" filled />
            </div>
            <div>
              <p className="font-medium text-on-surface text-sm">Ask the AI Tutor about {subject.name}</p>
              <p className="text-xs text-on-surface-variant">Opens AI Mentor pre-loaded with this subject's context.</p>
            </div>
          </div>
          <Link href="/mentor">
            <Button>Open AI Tutor</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <Card className="p-4">
      <Icon name={icon} className="text-on-surface-variant text-[18px]" />
      <p className="mt-2 text-lg font-bold text-on-surface">{value}</p>
      <p className="text-xs text-on-surface-variant">{label}</p>
    </Card>
  );
}