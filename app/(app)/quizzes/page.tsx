"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { quizFilters, quizList } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const DIFFICULTY_TONE: Record<string, "primary" | "secondary" | "tertiary"> = {
  Easy: "secondary",
  Medium: "primary",
  Hard: "tertiary",
};

export default function QuizzesPage() {
  const [filter, setFilter] = useState<string>("All");

  const filtered = filter === "All" ? quizList : quizList.filter((q) => q.type === filter);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Quizzes</h1>
        <p className="text-sm text-on-surface-variant mt-1">Practice by topic, subject, or take a full mock exam.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", ...quizFilters].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors",
              filter === f
                ? "bg-primary text-on-primary border-primary"
                : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((q) => (
          <Link key={q.id} href={`/quizzes/${q.id}/attempt`}>
            <Card className="p-5 h-full flex flex-col hover:bg-surface-container-low transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Badge tone="secondary">{q.type}</Badge>
                <Badge tone={DIFFICULTY_TONE[q.difficulty]}>{q.difficulty}</Badge>
              </div>
              <h3 className="font-medium text-sm text-on-surface leading-snug">{q.title}</h3>
              <p className="text-xs text-on-surface-variant mt-1">{q.subject}</p>
              <div className="mt-auto pt-4 flex items-center gap-4 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <Icon name="quiz" className="text-[16px]" />
                  {q.questions} questions
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="schedule" className="text-[16px]" />
                  {q.minutes} min
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}