"use client";

import Link from "next/link";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Card, ProgressRing, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  currentUser,
  weeklyProgress,
  todayTasks,
  currentAffairsPreview,
  continueLearning,
  readinessScore,
  studyStreak,
} from "@/lib/mock-data";

const QUICK_ACCESS = [
  { label: "Past Papers", icon: "history_edu", href: "/subjects" },
  { label: "Quizzes", icon: "quiz", href: "/quizzes" },
  { label: "Bookmarks", icon: "bookmark", href: "/bookmarks" },
  { label: "Exam Timeline", icon: "event", href: "/exam-timeline" },
];

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">
          Welcome back, {currentUser.name}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">{today} · Targeting CSS {currentUser.targetYear}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Readiness + streak */}
        <Card className="p-6 flex flex-col items-center text-center justify-center lg:col-span-1">
          <p className="text-sm font-medium text-on-surface-variant mb-2">CSS Readiness Score</p>
          <ProgressRing value={readinessScore} sublabel="Readiness" />
          <p className="mt-3 text-xs text-on-surface-variant">Up 4% from last week</p>
        </Card>

        <Card className="p-6 flex flex-col justify-center lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tertiary-container/20 text-tertiary">
              <Icon name="local_fire_department" filled className="text-[26px]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface">{studyStreak} days</p>
              <p className="text-sm text-on-surface-variant">Study streak</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-on-surface-variant">Keep it going — study today to extend your streak.</p>
        </Card>

        {/* AI Recommendation */}
        <Card className="p-6 flex flex-col justify-between lg:col-span-1 bg-primary-container/10 border-primary-container/40">
          <div>
            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
              <Icon name="auto_awesome" filled className="text-[18px]" />
              AI Recommendation
            </div>
            <p className="text-sm text-on-surface leading-relaxed">
              Your accuracy on Current Affairs quizzes dipped this week — spend
              30 minutes reviewing International Affairs before your next quiz.
            </p>
          </div>
          <Link href="/mentor" className="mt-4">
            <Button variant="outline" size="sm">Ask AI Mentor</Button>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's tasks */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="font-semibold text-on-surface mb-4">Today&apos;s Tasks</h2>
          <ul className="space-y-3">
            {todayTasks.map((t) => (
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
        </Card>

        {/* Weekly progress chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-on-surface">Weekly Progress</h2>
            <Badge tone="secondary">17.5 hrs this week</Badge>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--on-surface-variant)" }} />
                <Tooltip
                  cursor={{ fill: "var(--surface-container)" }}
                  contentStyle={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="hours" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Current affairs preview */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-on-surface">Current Affairs</h2>
            <Link href="/current-affairs" className="text-sm text-primary font-medium">See All</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1">
            {currentAffairsPreview.map((item) => (
              <div key={item.id} className="min-w-[220px] rounded-lg border border-outline-variant/40 p-4 shrink-0">
                <Badge tone={item.category === "Pakistan" ? "primary" : "tertiary"}>{item.category}</Badge>
                <p className="mt-2 text-sm font-medium text-on-surface leading-snug">{item.title}</p>
                <p className="mt-2 text-xs text-on-surface-variant">{item.date}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Continue learning */}
        <Card className="p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-on-surface mb-3">Continue Learning</h2>
            <p className="text-sm text-on-surface-variant">{continueLearning.subjectName}</p>
            <p className="text-sm font-medium text-on-surface mt-1">{continueLearning.topic}</p>
          </div>
          <Link href={`/subjects/${continueLearning.slug}`} className="mt-4">
            <Button className="w-full">Continue</Button>
          </Link>
        </Card>
      </div>

      {/* Quick access */}
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
