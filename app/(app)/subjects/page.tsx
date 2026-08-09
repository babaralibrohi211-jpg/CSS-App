"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, ProgressBar } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { subjects } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { QuizAttempt, computeSubjectBreakdown } from "@/lib/progress-data";

export default function SubjectsPage() {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "quizAttempts"), where("uid", "==", user.uid)));
        const attempts = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            subjectId: raw.subjectId || null,
            type: raw.type || "subject",
            score: raw.score,
            total: raw.total,
            accuracy: raw.accuracy,
            createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate() : new Date(raw.createdAt),
          } as QuizAttempt;
        });

        const breakdown = computeSubjectBreakdown(attempts);
        const map: Record<string, number> = {};
        for (const b of breakdown) {
          map[b.subjectId] = b.avgAccuracy;
        }
        setProgressMap(map);
      } catch (err) {
        console.error("Failed to load subject progress:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const compulsory = subjects.filter((s) => s.group === "Compulsory");
  const optional = subjects.filter((s) => s.group === "Optional");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Subjects</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Every subject includes syllabus, notes, books, past papers, quizzes, and an AI Tutor.
        </p>
      </div>

      <SubjectGroup title="Compulsory Subjects" items={compulsory} progressMap={progressMap} loading={loading} />
      <SubjectGroup title="Optional Subjects" items={optional} progressMap={progressMap} loading={loading} />
    </div>
  );
}

function SubjectGroup({
  title,
  items,
  progressMap,
  loading,
}: {
  title: string;
  items: typeof subjects;
  progressMap: Record<string, number>;
  loading: boolean;
}) {
  return (
    <section>
      <h2 className="font-semibold text-on-surface mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((s) => {
          const progress = loading ? 0 : progressMap[s.slug] ?? 0;
          return (
            <Link key={s.slug} href={`/subjects/${s.slug}`}>
              <Card className="p-5 h-full flex flex-col hover:bg-surface-container-low transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container/15 text-primary mb-3">
                  <Icon name={s.icon} filled />
                </div>
                <h3 className="font-medium text-on-surface text-sm leading-snug">{s.name}</h3>
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
                    <span>Quiz accuracy</span>
                    <span>{loading ? "..." : `${progress}%`}</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}