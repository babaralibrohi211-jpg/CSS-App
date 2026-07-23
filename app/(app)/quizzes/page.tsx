"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { subjects } from "@/lib/mock-data";
import { db } from "@/lib/firebase";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";

const FILTERS = ["All", "Subject", "Weekly", "Monthly", "Mock Exam"] as const;
type Filter = (typeof FILTERS)[number];

interface SubjectQuizCard {
  slug: string;
  name: string;
  icon: string;
  questionCount: number;
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default function QuizzesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>("All");
  const [subjectCards, setSubjectCards] = useState<SubjectQuizCard[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingSlug, setGeneratingSlug] = useState<string | null>(null);

  const weekNumber = getISOWeek(new Date());
  const monthLabel = new Date().toLocaleString("en-US", { month: "long" });

  async function loadCounts() {
    const counts = await Promise.all(
      subjects.map(async (s) => {
        const snap = await getCountFromServer(
          query(collection(db, "questionBank"), where("subjectId", "==", s.slug))
        );
        return { slug: s.slug, name: s.name, icon: s.icon, questionCount: snap.data().count };
      })
    );
    setSubjectCards(counts.filter((c) => c.questionCount > 0));
    setTotalQuestions(counts.reduce((sum, c) => sum + c.questionCount, 0));
  }

  useEffect(() => {
    (async () => {
      try {
        await loadCounts();
      } catch (err) {
        console.error("Failed to load quiz counts:", err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate(slug: string) {
    if (!user || generatingSlug) return;
    setGeneratingSlug(slug);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ subjectId: slug }),
      });
      if (res.ok) {
        await loadCounts();
      } else {
        const data = await res.json();
        alert(data.error || "Could not generate new questions right now.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong generating new questions.");
    } finally {
      setGeneratingSlug(null);
      router.push(`/quizzes/subject-${slug}/attempt?subject=${slug}`);
    }
  }

  const showSubject = filter === "All" || filter === "Subject";
  const showWeekly = filter === "All" || filter === "Weekly";
  const showMonthly = filter === "All" || filter === "Monthly";
  const showMock = filter === "All" || filter === "Mock Exam";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Quizzes</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Practice by subject, or take the rotating weekly/monthly mix and full mock exam. Generate fresh AI questions anytime, grounded in the real FPSC syllabus.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(function (f) {
          return (
            <button
              key={f}
              onClick={function () { setFilter(f); }}
              className={filter === f ? "rounded-full px-4 py-2 text-sm font-medium transition-colors bg-primary text-on-primary" : "rounded-full px-4 py-2 text-sm font-medium transition-colors border border-outline-variant text-on-surface-variant hover:bg-surface-container"}
            >
              {f}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      )}

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showWeekly && totalQuestions > 0 && (
            <a href="/quizzes/weekly/attempt?type=weekly">
              <Card className="p-5 hover:bg-surface-container-low transition-colors h-full">
                <div className="flex items-center justify-between mb-3">
                  <Badge tone="secondary">Weekly</Badge>
                  <Badge tone="tertiary">Medium</Badge>
                </div>
                <h3 className="font-semibold text-on-surface">Weekly Mixed Quiz - Week {weekNumber}</h3>
                <p className="text-sm text-on-surface-variant mt-1">Mixed subjects</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Icon name="quiz" className="text-[16px]" /> Up to 10 questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="schedule" className="text-[16px]" /> ~15 min
                  </span>
                </div>
              </Card>
            </a>
          )}

          {showMonthly && totalQuestions > 0 && (
            <a href="/quizzes/monthly/attempt?type=monthly">
              <Card className="p-5 hover:bg-surface-container-low transition-colors h-full">
                <div className="flex items-center justify-between mb-3">
                  <Badge tone="secondary">Monthly</Badge>
                  <Badge tone="tertiary">Hard</Badge>
                </div>
                <h3 className="font-semibold text-on-surface">Monthly Review - {monthLabel}</h3>
                <p className="text-sm text-on-surface-variant mt-1">Mixed subjects, broader coverage</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Icon name="quiz" className="text-[16px]" /> Up to 20 questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="schedule" className="text-[16px]" /> ~30 min
                  </span>
                </div>
              </Card>
            </a>
          )}

          {showMock && totalQuestions > 0 && (
            <a href="/quizzes/mock-full/attempt?type=mockexam">
              <Card className="p-5 hover:bg-surface-container-low transition-colors h-full">
                <div className="flex items-center justify-between mb-3">
                  <Badge tone="secondary">Mock Exam</Badge>
                  <Badge tone="tertiary">Hard</Badge>
                </div>
                <h3 className="font-semibold text-on-surface">Full-Length Mock Exam</h3>
                <p className="text-sm text-on-surface-variant mt-1">All subjects</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Icon name="quiz" className="text-[16px]" /> {totalQuestions} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="schedule" className="text-[16px]" /> ~{Math.round(totalQuestions * 1.5)} min
                  </span>
                </div>
              </Card>
            </a>
          )}

          {showSubject && subjectCards.map(function (s) {
            return (
              <Card key={s.slug} className="p-5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <Badge tone="primary">Subject</Badge>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={s.icon} className="text-[18px] text-primary" />
                  <h3 className="font-semibold text-on-surface">{s.name}</h3>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Icon name="quiz" className="text-[16px]" /> {s.questionCount} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="schedule" className="text-[16px]" /> ~{Math.round(s.questionCount * 1.5)} min
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <a href={"/quizzes/subject-" + s.slug + "/attempt?subject=" + s.slug} className="flex-1 text-center rounded-full border border-outline-variant px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container">
                    Start Quiz
                  </a>
                  <button
                    onClick={function () { handleGenerate(s.slug); }}
                    disabled={generatingSlug === s.slug}
                    className="flex-1 flex items-center justify-center gap-1 rounded-full bg-primary text-on-primary px-3 py-2 text-xs font-medium hover:opacity-90 disabled:opacity-60"
                  >
                    {generatingSlug === s.slug && (
                      <>
                        <div className="h-3 w-3 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></div>
                        Generating...
                      </>
                    )}
                    {generatingSlug !== s.slug && (
                      <>
                        <Icon name="auto_awesome" className="text-[14px]" />
                        New Questions
                      </>
                    )}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && totalQuestions === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Icon name="quiz" className="text-[32px] text-on-surface-variant/50 mb-3" />
          <p className="text-sm text-on-surface-variant">No quizzes available yet.</p>
        </div>
      )}
    </div>
  );
}