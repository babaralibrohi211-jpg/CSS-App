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
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";

const TABS = ["Overview", "Syllabus", "Notes", "Books", "Past Papers", "Quiz", "AI Tutor"] as const;
type Tab = (typeof TABS)[number];

type NoteDepth = "brief" | "detailed" | "exam-focused";

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
  fileUrl?: string;
  content?: string;
  source?: string;
}

interface RealPastPaper {
  id: string;
  year: number;
  isSolved: boolean;
  fileUrl: string;
}

interface RealSyllabus {
  totalMarks: number;
  paperPattern: { part: string; marks: number }[];
  recommendedTime: string;
  topics: string[];
  syllabusSource?: string;
}

const DEPTH_OPTIONS: { value: NoteDepth; label: string; desc: string }[] = [
  { value: "brief", label: "Brief", desc: "Quick revision points (1 page)" },
  { value: "detailed", label: "Detailed", desc: "Full study notes with analysis" },
  { value: "exam-focused", label: "Exam-Focused", desc: "Answer skeletons + high-yield points" },
];

export default function SubjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const subject = getSubjectDetail(slug);
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("Overview");
  const [bookmarked, setBookmarked] = useState(false);

  const [books, setBooks] = useState<RealBook[]>([]);
  const [notes, setNotes] = useState<RealNote[]>([]);
  const [pastPapers, setPastPapers] = useState<RealPastPaper[]>([]);
  const [realSyllabus, setRealSyllabus] = useState<RealSyllabus | null>(null);
  const [checkedTopics, setCheckedTopics] = useState<Set<number>>(new Set());
  const [contentLoading, setContentLoading] = useState(true);

  // AI Notes generation modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<NoteDepth>("detailed");
  const [extraInstructions, setExtraInstructions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<RealNote | null>(null);

  async function loadContent() {
    try {
      const [booksSnap, notesSnap, papersSnap, subjectDoc] = await Promise.all([
        getDocs(query(collection(db, "books"), where("subjectId", "==", slug))),
        getDocs(query(collection(db, "notes"), where("subjectId", "==", slug))),
        getDocs(query(collection(db, "pastPapers"), where("subjectId", "==", slug))),
        getDoc(doc(db, "subjects", slug)),
      ]);

      setBooks(booksSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RealBook)));
      setNotes(notesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RealNote)));
      setPastPapers(papersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RealPastPaper)));

      if (subjectDoc.exists()) {
        const data = subjectDoc.data();
        if (data.topics && data.topics.length > 0) {
          setRealSyllabus({
            totalMarks: data.totalMarks,
            paperPattern: data.paperPattern || [],
            recommendedTime: data.recommendedTime,
            topics: data.topics,
            syllabusSource: data.syllabusSource,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load subject content:", err);
    } finally {
      setContentLoading(false);
    }
  }

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!subject) return notFound();

  function toggleRealTopic(index: number) {
    setCheckedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function handleGenerateNotes() {
    if (!topic.trim() || !user) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          subjectId: slug,
          subjectName: subject!.name,
          topic: topic.trim(),
          depth,
          extraInstructions: extraInstructions.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }
      await loadContent();
      setShowGenerateModal(false);
      setTopic("");
      setExtraInstructions("");
      setDepth("detailed");
    } catch (err) {
      console.error(err);
      setGenerateError("Something went wrong generating these notes. Please try again.");
    } finally {
      setGenerating(false);
    }
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

  const displayStats = realSyllabus
    ? {
        totalMarks: realSyllabus.totalMarks,
        questions: realSyllabus.topics.length,
        split: subject.stats.split,
        recommendedTime: realSyllabus.recommendedTime,
      }
    : subject.stats;

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

          {realSyllabus && (
            <div className="flex items-center gap-2 text-xs text-secondary bg-secondary-container/15 rounded-lg px-3 py-2 w-fit">
              <Icon name="verified" filled className="text-[16px]" />
              Official FPSC syllabus data
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Marks" value={String(displayStats.totalMarks)} icon="workspace_premium" />
            <StatCard label="Topics/Sections" value={String(displayStats.questions)} icon="quiz" />
            <StatCard label="Category" value={displayStats.split} icon="category" />
            <StatCard label="Recommended Time" value={displayStats.recommendedTime} icon="schedule" />
          </div>

          {realSyllabus && realSyllabus.paperPattern.length > 0 && (
            <div>
              <h3 className="font-semibold text-on-surface mb-3">Paper Pattern</h3>
              <Card className="divide-y divide-outline-variant/30">
                {realSyllabus.paperPattern.map((p) => (
                  <div key={p.part} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-on-surface">{p.part}</span>
                    <span className="text-sm font-medium text-on-surface-variant">{p.marks} marks</span>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      )}

      {tab === "Syllabus" && (
        <div>
          {contentLoading ? (
            <LoadingRow />
          ) : realSyllabus ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-secondary bg-secondary-container/15 rounded-lg px-3 py-2 w-fit">
                <Icon name="verified" filled className="text-[16px]" />
                Official FPSC syllabus — {realSyllabus.topics.length} topics
              </div>
              <Card className="divide-y divide-outline-variant/30">
                {realSyllabus.topics.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => toggleRealTopic(i)}
                    className="w-full flex items-start gap-3 px-5 py-4 text-left"
                  >
                    <Icon
                      name={checkedTopics.has(i) ? "check_circle" : "radio_button_unchecked"}
                      filled={checkedTopics.has(i)}
                      className={cn("mt-0.5 shrink-0", checkedTopics.has(i) ? "text-primary" : "text-on-surface-variant")}
                    />
                    <span
                      className={cn(
                        "text-sm leading-relaxed",
                        checkedTopics.has(i) ? "text-on-surface-variant line-through" : "text-on-surface"
                      )}
                    >
                      {t}
                    </span>
                  </button>
                ))}
              </Card>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-tertiary bg-tertiary-container/15 rounded-lg px-3 py-2 w-fit">
                <Icon name="info" className="text-[16px]" />
                Placeholder syllabus — official topics not yet added for this subject
              </div>
              <Card className="divide-y divide-outline-variant/30">
                {subject.syllabus.map((t) => (
                  <div key={t.id} className="w-full flex items-center gap-3 px-5 py-4">
                    <Icon name="radio_button_unchecked" className="text-on-surface-variant" />
                    <span className="text-sm text-on-surface">{t.title}</span>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      )}

      {tab === "Notes" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowGenerateModal(true)}>
              <Icon name="auto_awesome" className="text-[18px]" />
              Generate AI Notes
            </Button>
          </div>

          {contentLoading ? (
            <LoadingRow />
          ) : notes.length === 0 ? (
            <EmptyState icon="description" text="No notes yet for this subject. Generate the first one with AI, or ask the AI Tutor." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {notes.map((note) =>
                note.fileUrl ? (
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
                ) : (
                  <button key={note.id} onClick={() => setViewingNote(note)} className="text-left">
                    <Card className="p-5 hover:bg-surface-container-low transition-colors cursor-pointer h-full">
                      <div className="flex items-center gap-2 text-secondary mb-2">
                        <Icon name="auto_awesome" filled className="text-[18px]" />
                        <span className="text-xs font-medium">AI-Generated</span>
                      </div>
                      <h3 className="font-medium text-sm text-on-surface">{note.title}</h3>
                      <p className="mt-2 text-xs text-on-surface-variant line-clamp-2">
                        {note.content?.replace(/[#*_>-]/g, "").slice(0, 100)}...
                      </p>
                    </Card>
                  </button>
                )
              )}
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
                            <p className="text-sm font-medium text-on-surface leading-snug line-clamp-2">{book.title}</p>
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
        <Card className="p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
              <Icon name="quiz" filled />
            </div>
            <div>
              <p className="font-medium text-on-surface text-sm">Practice quizzes for {subject.name}</p>
              <p className="text-xs text-on-surface-variant">
                Fresh AI-generated questions every attempt, grounded in the real syllabus.
              </p>
            </div>
          </div>
          <Link href={`/quizzes/subject-${slug}/attempt?subject=${slug}`}>
            <Button>Attempt Quiz</Button>
          </Link>
        </Card>
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

      {/* Generate AI Notes Modal */}
      {showGenerateModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
          onClick={() => !generating && setShowGenerateModal(false)}
        >
          <div
            className="bg-surface w-full sm:max-w-lg sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container/20 text-primary">
                  <Icon name="auto_awesome" />
                </div>
                <div>
                  <h2 className="font-semibold text-on-surface">Generate AI Notes</h2>
                  <p className="text-xs text-on-surface-variant">For {subject.name}</p>
                </div>
              </div>
              <button
                onClick={() => !generating && setShowGenerateModal(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Ideology of Pakistan"
                  disabled={generating}
                  className="w-full h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                {realSyllabus && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {realSyllabus.topics.slice(0, 4).map((t) => {
                      const short = t.split(" — ")[0].split(",")[0];
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTopic(short)}
                          disabled={generating}
                          className="text-xs px-2.5 py-1 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container"
                        >
                          {short}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Note Depth</label>
                <div className="grid grid-cols-3 gap-2">
                  {DEPTH_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDepth(opt.value)}
                      disabled={generating}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors",
                        depth === opt.value ? "border-primary bg-primary-container/10" : "border-outline-variant hover:bg-surface-container"
                      )}
                    >
                      <p className="text-sm font-medium text-on-surface">{opt.label}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">
                  Extra instructions (optional)
                </label>
                <textarea
                  value={extraInstructions}
                  onChange={(e) => setExtraInstructions(e.target.value)}
                  rows={2}
                  disabled={generating}
                  placeholder="e.g. Focus on post-1971 developments..."
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              {generateError && (
                <p className="text-sm text-error flex items-center gap-1.5">
                  <Icon name="error" className="text-[16px]" />
                  {generateError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-outline-variant/40">
              <Button variant="ghost" size="sm" onClick={() => setShowGenerateModal(false)} disabled={generating}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleGenerateNotes} disabled={generating || !topic.trim()}>
                {generating ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Icon name="auto_awesome" className="text-[16px]" />
                    Generate Notes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Note Viewer Modal */}
      {viewingNote && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
          onClick={() => setViewingNote(null)}
        >
          <div
            className="bg-surface w-full sm:max-w-2xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/40">
              <h2 className="font-semibold text-on-surface">{viewingNote.title}</h2>
              <button
                onClick={() => setViewingNote(null)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <pre className="text-sm text-on-surface whitespace-pre-wrap font-sans leading-relaxed">
                {viewingNote.content}
              </pre>
            </div>
          </div>
        </div>
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