// lib/progress-data.ts
// Pure functions that turn raw Firestore quizAttempts into real progress stats.
// No fabricated numbers — everything here is computed from what the user
// actually did.

export interface QuizAttempt {
  id: string;
  subjectId: string | null;
  type: string;
  score: number;
  total: number;
  accuracy: number;
  createdAt: Date;
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function computeStreaks(attempts: QuizAttempt[]): { current: number; best: number } {
  if (attempts.length === 0) return { current: 0, best: 0 };

  const uniqueDays = Array.from(new Set(attempts.map((a) => toDateKey(a.createdAt)))).sort();

  let best = 1;
  let run = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
  }

  // Current streak: walk backward from today
  const todayKey = toDateKey(new Date());
  const daySet = new Set(uniqueDays);
  let current = 0;
  const cursor = new Date();
  // Allow "today not yet studied" to still count yesterday's streak
  if (!daySet.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (daySet.has(toDateKey(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current, best };
}

export function computeSubjectBreakdown(
  attempts: QuizAttempt[]
): { subjectId: string; avgAccuracy: number; attemptCount: number }[] {
  const bySubject: Record<string, { total: number; count: number }> = {};
  for (const a of attempts) {
    if (!a.subjectId) continue;
    if (!bySubject[a.subjectId]) bySubject[a.subjectId] = { total: 0, count: 0 };
    bySubject[a.subjectId].total += a.accuracy;
    bySubject[a.subjectId].count += 1;
  }
  return Object.entries(bySubject).map(([subjectId, v]) => ({
    subjectId,
    avgAccuracy: Math.round(v.total / v.count),
    attemptCount: v.count,
  }));
}

export function computeReadinessScore(params: {
  avgAccuracy: number;
  subjectsPracticed: number;
  totalSubjects: number;
  currentStreak: number;
  totalAttempts: number;
}): number {
  const accuracyComponent = params.avgAccuracy * 0.4;
  const coverageComponent = (params.subjectsPracticed / params.totalSubjects) * 100 * 0.3;
  const streakComponent = Math.min(params.currentStreak / 14, 1) * 100 * 0.15;
  const volumeComponent = Math.min(params.totalAttempts / 30, 1) * 100 * 0.15;
  return Math.round(accuracyComponent + coverageComponent + streakComponent + volumeComponent);
}

export function buildHeatmap(attempts: QuizAttempt[], days = 84): { day: number; active: boolean }[] {
  const activeDays = new Set(attempts.map((a) => toDateKey(a.createdAt)));
  const result: { day: number; active: boolean }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push({ day: days - i, active: activeDays.has(toDateKey(d)) });
  }
  return result;
}