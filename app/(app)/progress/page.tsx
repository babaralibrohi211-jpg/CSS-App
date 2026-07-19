"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, ProgressBar, ProgressRing } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { progressStats, studyStreak, streakCalendar } from "@/lib/mock-data";

const DONUT_COLORS = ["var(--color-primary)", "var(--color-surface-container-high)"];

export default function ProgressPage() {
  const { studyHoursTotal, studyHoursTrend, quizAccuracyTrend, subjectsCompleted, subjectsTotal, topicsCompletedPct, weeklyBars, readinessHistory } =
    progressStats;

  const donutData = [
    { name: "Completed", value: subjectsCompleted },
    { name: "Remaining", value: subjectsTotal - subjectsCompleted },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Progress & Analytics</h1>
        <p className="text-sm text-on-surface-variant mt-1">A full picture of where your preparation stands.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
            <Icon name="schedule" className="text-[18px]" />
            Study Hours
          </div>
          <p className="text-2xl font-bold text-on-surface">{studyHoursTotal} hrs</p>
          <p className="text-xs text-primary mt-1">{studyHoursTrend}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
            <Icon name="local_fire_department" className="text-[18px]" />
            Learning Streak
          </div>
          <p className="text-2xl font-bold text-on-surface">{studyStreak} days</p>
          <p className="text-xs text-on-surface-variant mt-1">Personal best: 21 days</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
            <Icon name="checklist" className="text-[18px]" />
            Topics Completed
          </div>
          <p className="text-2xl font-bold text-on-surface">{topicsCompletedPct}%</p>
          <ProgressBar value={topicsCompletedPct} className="mt-3" />
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <PieChart width={64} height={64}>
              <Pie data={donutData} dataKey="value" innerRadius={22} outerRadius={30} startAngle={90} endAngle={-270}>
                {donutData.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Subjects Completed</p>
            <p className="text-xl font-bold text-on-surface">
              {subjectsCompleted}/{subjectsTotal}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-semibold text-on-surface mb-4">Quiz Accuracy Over Time</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quizAccuracyTrend}>
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--on-surface-variant)" }} />
                <Tooltip
                  contentStyle={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-on-surface-variant mb-2">CSS Readiness Score</p>
          <ProgressRing value={68} sublabel="Readiness" />
          <div className="h-16 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readinessHistory}>
                <Line type="monotone" dataKey="score" stroke="var(--color-secondary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6 lg:col-span-1">
          <h2 className="font-semibold text-on-surface mb-4">Weekly / Monthly Progress</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBars}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }} />
                <Tooltip
                  contentStyle={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="hours" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="font-semibold text-on-surface mb-4">Study Streak Heatmap</h2>
          <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] sm:grid-cols-[repeat(21,minmax(0,1fr))] gap-1.5">
            {streakCalendar.map((d) => (
              <div
                key={d.day}
                className="aspect-square rounded-sm"
                style={{
                  background: d.active ? "var(--color-primary)" : "var(--color-surface-container-high)",
                  opacity: d.active ? 0.4 + (d.day % 5) * 0.12 : 1,
                }}
              />
            ))}
          </div>
          <p className="text-xs text-on-surface-variant mt-3">Last 12 weeks of activity</p>
        </Card>
      </div>
    </div>
  );
}