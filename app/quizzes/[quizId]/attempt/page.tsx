"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { ProgressBar, Card } from "@/components/ui/card";
import { quizQuestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function QuizAttemptPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReview = searchParams.get("mode") === "review";

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const question = quizQuestions[current];
  const total = quizQuestions.length;

  // Guard against any leftover scroll position from the previous page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // In review mode, load the saved answers/flags from the last attempt
  // instead of starting a fresh quiz.
  useEffect(() => {
    if (!isReview) return;
    const raw = sessionStorage.getItem(`quiz-result-${quizId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      setAnswers(parsed.answers || {});
      setFlagged(new Set(parsed.flagged || []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReview, quizId]);

  useEffect(() => {
    if (isReview) return; // no timer needed when just reviewing
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [isReview]);

  useEffect(() => {
    if (isReview) return; // nothing to lose in review mode, no warning needed
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isReview]);

  useEffect(() => {
    if (isReview) return;
    if (secondsLeft === 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, isReview]);

  function selectOption(index: number) {
    if (isReview) return; // read-only
    setAnswers((prev) => ({ ...prev, [question.id]: index }));
  }

  function toggleFlag() {
    if (isReview) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) next.delete(question.id);
      else next.add(question.id);
      return next;
    });
  }

  function previous() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  function next() {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
    } else if (isReview) {
      router.push(`/quizzes/${quizId}/result`);
    } else {
      finish();
    }
  }

  function finish() {
    const correct = quizQuestions.filter((q) => answers[q.id] === q.correctIndex).length;
    sessionStorage.setItem(
      `quiz-result-${quizId}`,
      JSON.stringify({ correct, total, answers, flagged: Array.from(flagged) })
    );
    router.push(`/quizzes/${quizId}/result`);
  }

  function confirmExit() {
    router.push("/quizzes");
  }

  function handleBack() {
    if (isReview) {
      router.push(`/quizzes/${quizId}/result`);
    } else {
      setShowExitConfirm(true);
    }
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const answeredCount = Object.keys(answers).length;
  const selectedIndex = answers[question.id];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="pb-3 border-b border-outline-variant/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              aria-label="Back"
            >
              <Icon name="arrow_back" className="text-[20px]" />
            </button>
            <span className="text-sm font-medium text-on-surface-variant">
              Question {current + 1} of {total}
            </span>
          </div>
          {isReview ? (
            <span className="flex items-center gap-1.5 text-sm font-semibold rounded-full px-3 py-1 bg-primary-container/20 text-primary">
              <Icon name="visibility" className="text-[16px]" />
              Review Mode
            </span>
          ) : (
            <span
              className={cn(
                "flex items-center gap-1.5 text-sm font-semibold rounded-full px-3 py-1",
                secondsLeft < 60 ? "bg-error-container text-on-error-container" : "bg-tertiary-container/20 text-tertiary"
              )}
            >
              <Icon name="timer" className="text-[16px]" />
              {mins}:{secs.toString().padStart(2, "0")}
            </span>
          )}
        </div>
        <ProgressBar value={((current + 1) / total) * 100} />
      </div>

      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-on-surface leading-snug">{question.question}</h2>
          <button
            onClick={toggleFlag}
            disabled={isReview}
            className={cn(
              "shrink-0 flex h-9 w-9 items-center justify-center rounded-full border",
              flagged.has(question.id)
                ? "border-tertiary bg-tertiary-container/20 text-tertiary"
                : "border-outline-variant text-on-surface-variant hover:bg-surface-container",
              isReview && "opacity-50 cursor-default"
            )}
            aria-label="Flag for review"
          >
            <Icon name="flag" filled={flagged.has(question.id)} className="text-[18px]" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {question.options.map((opt, i) => {
            const selected = selectedIndex === i;
            const isCorrectOption = i === question.correctIndex;

            let stateClasses = "border-outline-variant text-on-surface hover:bg-surface-container";
            if (isReview) {
              if (isCorrectOption) {
                stateClasses = "border-secondary bg-secondary-container/20 text-on-surface";
              } else if (selected && !isCorrectOption) {
                stateClasses = "border-error bg-error-container/15 text-on-surface";
              } else {
                stateClasses = "border-outline-variant text-on-surface-variant";
              }
            } else if (selected) {
              stateClasses = "border-primary bg-primary-container/10 text-primary";
            }

            return (
              <button
                key={opt}
                onClick={() => selectOption(i)}
                disabled={isReview}
                className={cn(
                  "w-full text-left rounded-xl border px-4 py-4 text-sm font-medium transition-colors flex items-center gap-3",
                  stateClasses,
                  isReview && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                    isReview && isCorrectOption
                      ? "border-secondary bg-secondary text-on-secondary"
                      : isReview && selected && !isCorrectOption
                      ? "border-error bg-error text-on-error"
                      : selected
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant text-on-surface-variant"
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {isReview && isCorrectOption && (
                  <Icon name="check_circle" filled className="text-[18px] text-secondary" />
                )}
                {isReview && selected && !isCorrectOption && (
                  <Icon name="cancel" filled className="text-[18px] text-error" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={previous}
          disabled={current === 0}
          className="inline-flex items-center gap-2 rounded-full border border-outline-variant text-on-surface px-6 h-11 text-sm font-medium hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          Previous
        </button>

        <button
          onClick={next}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary px-6 h-11 text-sm font-medium hover:opacity-90"
        >
          {current < total - 1 ? "Next" : isReview ? "Back to Results" : "Finish Quiz"}
          <Icon name="arrow_forward" className="text-[18px]" />
        </button>
      </div>

      {showExitConfirm && !isReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowExitConfirm(false)}
        >
          <Card
            className="w-full max-w-sm p-6"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-container/20 text-error mb-4">
              <Icon name="warning" filled className="text-[24px]" />
            </div>
            <h3 className="text-lg font-semibold text-on-surface">Exit this quiz?</h3>
            <p className="mt-1.5 text-sm text-on-surface-variant">
              You&apos;ve answered {answeredCount} of {total} questions. Your progress won&apos;t be
              saved and this attempt won&apos;t count if you leave now.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 rounded-full border border-outline-variant text-on-surface h-11 text-sm font-medium hover:bg-surface-container"
              >
                Keep Going
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 rounded-full bg-error text-on-error h-11 text-sm font-medium hover:opacity-90"
              >
                Exit Quiz
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}