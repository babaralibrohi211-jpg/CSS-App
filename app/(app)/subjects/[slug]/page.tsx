"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, ProgressRing, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getSubjectDetail } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const TABS = ["Overview", "Syllabus", "Notes", "Books", "Past Papers", "Quiz", "AI Tutor"] as const;
type Tab = (typeof TABS)[number];

interface RealBook {
  id: string;
  title: string;
  author: string;
  level: "beginner" | "intermediate" | "advanced";
  fileUrl: string;
}

interface RealNote {
  id: string;
  title: string;
  fileUrl: string;
}

interface RealPastPaper {
  id: string;
  year: number;
  isSolved: boolean;
  fileUrl: string;
}

export default function SubjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const subject = getSubjectDetail(slug);
  const [tab, setTab] = useState<Tab>("Overview");
  const [bookmarked, setBookmarked] = useState(false);
  const [syllabus, setSyllabus] = useState(subject?.syllabus ?? []);

  const [books, setBooks] = useState<RealBook[]>([]);
  const [notes, setNotes] = useState<RealNote[]>([]);
  const [pastPapers, setPastPapers] = useState<RealPastPaper[]>([]);
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [booksSnap, notesSnap, papersSnap] = await Promise.all([
          getDocs(query(collection(db, "books"), where("subjectId", "==", slug))),
          getDocs(query(collection(db, "notes"), where("subjectId", "==", slug))),
          getDocs(query(collection(db, "pastPapers"), where("subjectId", "==", slug))),
        ]);

        setBooks(
          booksSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RealBook))
        );
        setNotes(
          notesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RealNote))
        );
        setPastPapers(
          papersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RealPastPaper))
        );
      } catch (err) {
        console.error("Failed to load subject content:", err);
      } finally {
        setContentLoading(false);
      }
    })();
  }, [slug]);

  if (!subject) return notFound();

  function toggleTopic(id: number) {
    setSyllabus((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  const booksByLevel = {
    beginner: books.filter((b) => b.level === "beginner"),
    intermediate: books.filter((b) => b.level === "intermediate"),
    advanced: books.filter((b) => b.level === "advanced"),
  };

  const papersByYear = pastPapers.reduce<Record<number, { paper?: string; solved?: string }>>(
    (acc, p) => {
      if (!acc[p.year]) acc[p.year] = {};
      if (p.isSolved) acc[p.year].solved = p.fileUrl;
      else acc[p.year].paper = p.fileUrl;
      return acc;
    },
    {}
  );
  const sortedYears = Object.keys(papersByYear)
    .map(Number)
    .sort((a, b) => b - a);

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
        <div>
          {contentLoading ? (
            <LoadingRow />
          ) : notes.length === 0 ? (
            <EmptyState icon="description" text="No notes uploaded yet for this subject." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {notes.map((note) => (
                <a key={note.id} href={note.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Card className="p-5 hover:bg-surface-container-low transition-colors cursor-pointer h-full">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Icon name="description" filled className="text-[18px]" />
                      <span className="text-xs font-medium">Notes</span>
                    </div>
                    <h3 className="font-medium text-sm text-on-surface">{note.title}</h3>
                    <p className="mt-2 text-xs text-primary flex items-center gap-1">
                      Open PDF <Icon name="open_in_new" className="text-[14px]" />
                    </p>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "Books" && (
        <div className="space-y-6">
          {contentLoading ? (
            <LoadingRow />
          ) : books.length === 0 ? (
            <EmptyState icon="menu_book" text="No books uploaded yet for this subject." />
          ) : (
            (["beginner", "intermediate", "advanced"] as const).map((level) =>
              booksByLevel[level].length === 0 ? null : (
                <div key={level}>
                  <h3 className="font-semibold text-on-surface mb-3 capitalize">{level}</h3>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {booksByLevel[level].map((book) => (
                      <a key={book.id} href={book.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Card className="p-4 flex gap-3 hover:bg-surface-container-low transition-colors h-full">
                          <div className="h-16 w-12 shrink-0 rounded-md bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                            <Icon name="menu_book" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-on-surface leading-snug line-clamp-2">
                              {book.title}
                            </p>
                            <p className="text-xs text-on-surface-variant mt-1">{book.author}</p>
                            <p className="mt-1.5 text-xs text-primary flex items-center gap-1">
                              Open <Icon name="open_in_new" className="text-[12px]" />
                            </p>
                          </div>
                        </Card>
                      </a>
                    ))}
                  </div>
                </div>
              )
            )
          )}
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

          {contentLoading ? (
            <LoadingRow />
          ) : sortedYears.length === 0 ? (
            <EmptyState icon="history_edu" text="No past papers uploaded yet for this subject." />
          ) : (
            <Card className="divide-y divide-outline-variant/30">
              {sortedYears.map((year) => (
                <div key={year} className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm font-medium text-on-surface">{year}</span>
                  <div className="flex gap-2">
                    {papersByYear[year].paper && (
                      <a href={papersByYear[year].paper} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">View Paper</Button>
                      </a>
                    )}
                    {papersByYear[year].solved && (
                      <a href={papersByYear[year].solved} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">View Solved</Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          )}
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

function LoadingRow() {
  return (
    <div className="flex justify-center py-10">
      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon name={icon} className="text-[32px] text-on-surface-variant/50 mb-3" />
      <p className="text-sm text-on-surface-variant">{text}</p>
    </div>
  );
}