"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth-context";
import { subjects } from "@/lib/mock-data";

interface QuizQuestion {
  id: number | string;
  question: string;
  options: string[];
  correctIndex: number;
}

export default function QuizResultPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const { user } = useAuth();
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null);
  const [retakeHref, setRetakeHref] = useState(`/quizzes/${quizId}/attempt`);
  const [subjectName, setSubjectName] = useState("this subject");

  const [feedback, setFeedback] = useState<{ weakAreas: string[]; improvementPlan: string } | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem(`quiz-result-${quizId}`);
    if (!raw) {
      setResult({ correct: 3, total: 5 });
      setFeedbackLoading(false);
      return;
    }

    const parsed = JSON.parse(raw);
    setResult({ correct: parsed.correct, total: parsed.total });

    const qs = new URLSearchParams();
    if (parsed.subjectParam) qs.set("subject", parsed.subjectParam);
    if (parsed.typeParam) qs.set("type", parsed.typeParam);
    const query = qs.toString();
    setRetakeHref(`/quizzes/${quizId}/attempt${query ? `?${query}` : ""}`);

    const matchedSubject = subjects.find((s) => s.slug === parsed.subjectParam);
    const resolvedSubjectName = matchedSubject?.name || parsed.subjectParam || "this subject";
    setSubjectName(resolvedSubjectName);

    // Generate REAL feedback based on the questions actually gotten wrong —
    // no more hardcoded "Constitutional History" regardless of subject.
    (async () => {
      if (!user || !parsed.questions) {
        setFeedbackLoading(false);
        return;
      }
      try {
        const questions: QuizQuestion[] = parsed.questions;
        const answers: Record<string, number> = parsed.answers || {};
        const wrongQuestions = questions
          .filter((q) => answers[q.id] !== undefined && answers[q.id] !== q.correctIndex)
          .map((q) => ({
            question: q.question,
            yourAnswer: q.options[answers[q.id]] ?? "No answer",
            correctAnswer: q.options[q.correctIndex],
          }));

        const idToken = await user.getIdToken();
        const res = await fetch("/api/generate-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({
            subjectName: resolvedSubjectName,
            correct: parsed.correct,
            total: parsed.total,
            wrongQuestions,
          }),
        });
        if (res.ok) {
          setFeedback(await res.json());
        }
      } catch (err) {
        console.error("Failed to generate feedback:", err);
      } finally {
        setFeedbackLoading(false);
      }
    })();
  }, [quizId, user]);

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
        <p className="text-sm text-on-surface-variant mt-1">{subjectName} — here's how you did.</p>
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

        {feedbackLoading ? (
          <div className="h-4 w-32 mt-4 rounded bg-surface-container-high animate-pulse" />
        ) : feedback && feedback.weakAreas.length > 0 ? (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {feedback.weakAreas.map((area) => (
              <Badge key={area} tone="tertiary">
                Weak Area: {area}
              </Badge>
            ))}
          </div>
        ) : null}
      </Card>

      <Card className="p-6 text-left">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Icon name="auto_awesome" filled className="text-[18px]" />
          <span className="text-sm font-semibold">AI-Generated Improvement Plan</span>
        </div>
        {feedbackLoading ? (
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-surface-container-high animate-pulse" />
            <div className="h-3 w-4/5 rounded bg-surface-container-high animate-pulse" />
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {feedback?.improvementPlan ||
              "Review the questions you missed above and try this quiz again to reinforce these topics."}
          </p>
        )}
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/quizzes/${quizId}/attempt?mode=review`}>
          <Button variant="outline" className="w-full sm:w-auto">Review Answers</Button>
        </Link>
        <Link href={retakeHref}>
          <Button className="w-full sm:w-auto">Retake Quiz</Button>
        </Link>
      </div>
    </div>
  );
}