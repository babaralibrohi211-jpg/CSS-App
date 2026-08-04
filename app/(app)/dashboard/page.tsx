"use client";

import { useEffect, useState } from "react";
import { WordOfDayCard } from "@/components/word-of-day-card";
import Link from "next/link";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Card, ProgressRing, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { subjects } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { QuizAttempt, computeStreaks, computeSubjectBreakdown, computeReadinessScore } from "@/lib/progress-data";

const QUICK_ACCESS = [
  { label: "Past Papers", icon: "history_edu", href: "/subjects" },
  { label: "Quizzes", icon: "quiz", href: "/quizzes" },
  { label: "Bookmarks", icon: "bookmark", href: "/bookmarks" },
  { label: "AI Mentor", icon: "smart_toy", href: "/mentor" },
];

interface DailyTask {
  id: string;
  label: string;
  subject: string;
  done: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [targetYear, setTargetYear] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [lastSubjectSlug, setLastSubjectSlug] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [userDoc, attemptsSnap, planDoc] = await Promise.all([
          getDoc(doc(db, "users", user.uid)),
          getDocs(query(collection(db, "quizAttempts"), where("uid", "==", user.uid))),
          getDoc(doc(db, "studyPlans", user.uid)),
        ]);

        const userData = userDoc.exists() ? userDoc.data() : null;
        setDisplayName(userData?.name || user.displayName || "there");
        setTargetYear(userData?.onboarding?.targetYear || null);

        const attemptData = attemptsSnap.docs
          .map((d) => {
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
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setAttempts(attemptData);

        if (attemptData.length > 0 && attemptData[0].subjectId) {
          setLastSubjectSlug(attemptData[0].subjectId);
        }

        if (planDoc.exists()) {
          setDailyTasks((planDoc.data().dailyTasks || []).slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const hasAttempts = attempts.length > 0;
  const avgAccuracy = hasAttempts ? Math.round(attempts.reduce((s, a) => s + a.accuracy, 0) / attempts.length) : 0;
  const { current: currentStreak } = computeStreaks(attempts);
  const subjectBreakdown = computeSubjectBreakdown(attempts);
  const readiness = hasAttempts
    ? computeReadinessScore({
        avgAccuracy,
        subjectsPracticed: subjectBreakdown.length,
        totalSubjects: subjects.length,
        currentStreak,
        totalAttempts: attempts.length,
      })
    : 0;

  const weakest = subjectBreakdown.length > 0 ? [...subjectBreakdown].sort((a, b) => a.avgAccuracy - b.avgAccuracy)[0] : null;
  const subjectNameMap = Object.fromEntries(subjects.map((s) => [s.slug, s.name]));

  const weeklyMap: Record<string, number> = {};
  const last7Days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d);
    weeklyMap[d.toDateString()] = 0;
  }
  for (const a of attempts) {
    const key = a.createdAt.toDateString();
    if (key in weeklyMap) weeklyMap[key] += 1;
  }
  const weeklyBars = last7Days.map((d) => ({
    day: d.toLocaleDateString("en-US", { weekday: "short" }),
    quizzes: weeklyMap[d.toDateString()],
  }));
  const quizzesThisWeek = weeklyBars.reduce((s, d) => s + d.quizzes, 0);

  const continueSubjectName = lastSubjectSlug ? subjectNameMap[lastSubjectSlug] || lastSubjectSlug : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Welcome back, {displayName}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {today} {targetYear ? `· Targeting CSS ${targetYear}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6 flex flex-col items-center text-center justify-center lg:col-span-1">
          <p className="text-sm font-medium text-on-surface-variant mb-2">CSS Readiness Score</p>
          <ProgressRing value={readiness} sublabel="Readiness" />
          {!hasAttempts && (
            <p className="mt-3 text-xs text-on-surface-variant">Take your first quiz to get a real score</p>
          )}
        </Card>

        <Card className="p-6 flex flex-col justify-center lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tertiary-container/20 text-tertiary">
              <Icon name="local_fire_department" filled className="text-[26px]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface">{currentStreak} days</p>
              <p className="text-sm text-on-surface-variant">Study streak</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-on-surface-variant">
            {currentStreak > 0 ? "Keep it going — study today to extend your streak." : "Take a quiz today to start your streak."}
          </p>
        </Card>

        <Card className="p-6 flex flex-col justify-between lg:col-span-1 bg-primary-container/10 border-primary-container/40">
          <div>
            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
              <Icon name="auto_awesome" filled className="text-[18px]" />
              Recommendation
            </div>
            <p className="text-sm text-on-surface leading-relaxed">
              {weakest
                ? `Your accuracy on ${subjectNameMap[weakest.subjectId] || weakest.subjectId} is ${weakest.avgAccuracy}% — spend some time reviewing it before your next quiz.`
                : "Take a few quizzes across different subjects — recommendations will appear here based on your real performance."}
            </p>
          </div>
          <Link href="/mentor" className="mt-4">
            <Button variant="outline" size="sm">Ask AI Mentor</Button>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6 lg:col-span-1">
          <h2 className="font-semibold text-on-surface mb-4">Today&apos;s Tasks</h2>
          {dailyTasks.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-on-surface-variant mb-3">No plan yet.</p>
              <Link href="/planner">
                <Button variant="outline" size="sm">Generate a Study Plan</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {dailyTasks.map((t) => (
                <li key={t.id} className="flex items-start gap-3">
                  <Icon
                    name={t.done ? "check_circle" : "radio_button_unchecked"}
                    filled={t.done}
                    className={t.done ? "text-primary mt-0.5" : "text-on-surface-variant mt-0.5"}
                  />
                  <span className={`text-sm ${t.done ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                    {t.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-on-surface">Quizzes This Week</h2>
            <Badge tone="secondary">{quizzesThisWeek} total</Badge>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBars}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--on-surface-variant)" }} />
                <Tooltip
                  cursor={{ fill: "var(--surface-container)" }}
                  contentStyle={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="quizzes" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-semibold text-on-surface mb-2">Current Affairs</h2>
          <p className="text-sm text-on-surface-variant mb-4">
            Practice quizzes grounded in real, current news headlines — updated daily.
          </p>
          <Link href="/subjects/current-affairs">
            <Button variant="outline" size="sm">Go to Current Affairs</Button>
          </Link>
        </Card>

        <Card className="p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-on-surface mb-3">Continue Learning</h2>
            {continueSubjectName ? (
              <p className="text-sm font-medium text-on-surface">{continueSubjectName}</p>
            ) : (
              <p className="text-sm text-on-surface-variant">You haven't started a subject yet.</p>
            )}
          </div>
          <Link href={lastSubjectSlug ? `/subjects/${lastSubjectSlug}` : "/subjects"} className="mt-4">
            <Button className="w-full">{continueSubjectName ? "Continue" : "Browse Subjects"}</Button>
          </Link>
        </Card>
      </div>

      <WordOfDayCard />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {QUICK_ACCESS.map((q) => (
          <Link key={q.label} href={q.href}>
            <Card className="p-5 flex flex-col items-center gap-2 text-center hover:bg-surface-container-low transition-colors">
              <Icon name={q.icon} className="text-primary text-[26px]" />
              <span className="text-sm font-medium text-on-surface">{q.label}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}