"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function QuizResultPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`quiz-result-${quizId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      setResult({ correct: parsed.correct, total: parsed.total });
    } else {
      setResult({ correct: 3, total: 5 });
    }
  }, [quizId]);

  if (!result) return null;

  const accuracy = Math.round((result.correct / result.total) * 100);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        href="/quizzes"
        className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <Icon name="arrow_back" className="text-[18px]" />
        Back to Quizzes
      </Link>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-on-surface">Quiz Complete</h1>
        <p className="text-sm text-on-surface-variant mt-1">Here's how you did.</p>
      </div>

      <Card className="p-8 flex flex-col items-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-8 border-primary-container/30 relative">
          <div
            className="absolute inset-0 rounded-full border-8 border-primary"
            style={{
              clipPath: `polygon(0 0, 100% 0, 100% ${accuracy}%, 0 ${accuracy}%)`,
            }}
          />
          <span className="text-2xl font-bold text-on-surface z-10">
            {result.correct}/{result.total}
          </span>
        </div>
        <p className="mt-4 text-lg font-semibold text-on-surface">{accuracy}% Accuracy</p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Badge tone="tertiary">Weak Area: Constitutional History</Badge>
          <Badge tone="tertiary">Weak Area: Foreign Policy</Badge>
        </div>
      </Card>

      <Card className="p-6 text-left">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Icon name="auto_awesome" filled className="text-[18px]" />
          <span className="text-sm font-semibold">AI-Generated Improvement Plan</span>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          You did well on ideology-related questions but missed items on constitutional
          amendments and foreign policy. Spend 30 minutes reviewing the 18th Amendment
          and CPEC before attempting a similar quiz again.
        </p>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/quizzes/${quizId}/attempt?mode=review`}>
          <Button variant="outline" className="w-full sm:w-auto">Review Answers</Button>
        </Link>
        <Link href={`/quizzes/${quizId}/attempt`}>
          <Button className="w-full sm:w-auto">Retake Quiz</Button>
        </Link>
      </div>
    </div>
  );
}