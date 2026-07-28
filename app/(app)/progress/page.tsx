"use client";

import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { Card, ProgressRing } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { subjects } from "@/lib/mock-data";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import {
  QuizAttempt,
  computeStreaks,
  computeSubjectBreakdown,
  computeReadinessScore,
  buildHeatmap,
} from "@/lib/progress-data";

export default function ProgressPage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "quizAttempts"), where("uid", "==", user.uid)));
        const data = snap.docs.map((d) => {
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
        data.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        setAttempts(data);
      } catch (err) {
        console.error("Failed to load quiz attempts:", err);
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

  if (attempts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Progress & Analytics</h1>
          <p className="text-sm text-on-surface-variant mt-1">A full picture of where your preparation stands.</p>
        </div>
        <Card className="p-10 flex flex-col items-center text-center">
          <Icon name="monitoring" className="text-[40px] text-on-surface-variant/40 mb-3" />
          <p className="text-sm text-on-surface-variant max-w-sm">
            No quiz attempts yet. Take a few quizzes and your real progress, accuracy, and readiness score
            will show up here.
          </p>
        </Card>
      </div>
    );
  }

  const totalAttempts = attempts.length;
  const avgAccuracy = Math.round(attempts.reduce((s, a) => s + a.accuracy, 0) / totalAttempts);
  const { current: currentStreak, best: bestStreak } = computeStreaks(attempts);
  const subjectBreakdown = computeSubjectBreakdown(attempts).sort((a, b) => a.avgAccuracy - b.avgAccuracy);
  const subjectsPracticed = subjectBreakdown.length;
  const readiness = computeReadinessScore({
    avgAccuracy,
    subjectsPracticed,
    totalSubjects: subjects.length,
    currentStreak,
    totalAttempts,
  });
  const heatmap = buildHeatmap(attempts);

  const trendData = attempts.slice(-10).map((a, i) => ({
    session: `S${i + 1}`,
    accuracy: a.accuracy,
  }));

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

  const subjectNameMap = Object.fromEntries(subjects.map((s) => [s.slug, s.name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Progress & Analytics</h1>
        <p className="text-sm text-on-surface-variant mt-1">A full picture of where your preparation stands.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
            <Icon name="quiz" className="text-[18px]" />
            Total Quizzes Taken
          </div>
          <p className="text-2xl font-bold text-on-surface">{totalAttempts}</p>
          <p className="text-xs text-on-surface-variant mt-1">{avgAccuracy}% average accuracy</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
            <Icon name="local_fire_department" className="text-[18px]" />
            Learning Streak
          </div>
          <p className="text-2xl font-bold text-on-surface">{currentStreak} days</p>
          <p className="text-xs text-on-surface-variant mt-1">Personal best: {bestStreak} days</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
            <Icon name="menu_book" className="text-[18px]" />
            Subjects Practiced
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {subjectsPracticed}/{subjects.length}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">At least one quiz attempted</p>
        </Card>

        <Card className="p-5 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-on-surface-variant mb-1">CSS Readiness Score</p>
          <ProgressRing value={readiness} size={64} strokeWidth={6} sublabel="Readiness" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <h2 className="font-semibold text-on-surface mb-4">Accuracy — Last {trendData.length} Quizzes</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="session" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-on-surface mb-4">Quizzes This Week</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBars}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="quizzes" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-on-surface mb-4">Accuracy by Subject</h2>
        <div className="space-y-3">
          {subjectBreakdown.map((s) => (
            <div key={s.subjectId} className="flex items-center gap-3">
              <span className="text-sm text-on-surface w-40 shrink-0 truncate">
                {subjectNameMap[s.subjectId] || s.subjectId}
              </span>
              <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${s.avgAccuracy}%`,
                    background: s.avgAccuracy < 50 ? "var(--color-error)" : "var(--color-primary)",
                  }}
                />
              </div>
              <span className="text-xs text-on-surface-variant w-16 text-right shrink-0">
                {s.avgAccuracy}% ({s.attemptCount})
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-on-surface mb-4">Study Activity Heatmap</h2>
        <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] sm:grid-cols-[repeat(21,minmax(0,1fr))] gap-1.5">
          {heatmap.map((d) => (
            <div
              key={d.day}
              className="aspect-square rounded-sm"
              style={{
                background: d.active ? "var(--color-primary)" : "var(--color-surface-container-high)",
              }}
            />
          ))}
        </div>
        <p className="text-xs text-on-surface-variant mt-3">Last 12 weeks — real quiz activity</p>
      </Card>
    </div>
  );
}