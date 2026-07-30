"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card, ProgressBar } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const YEARS = [2026, 2027, 2028, 2029];
const HOURS = ["1–2 hrs", "3–4 hrs", "5–6 hrs", "7+ hrs"];
const LEVELS = [
  { key: "beginner", label: "Beginner", desc: "Just getting started" },
  { key: "intermediate", label: "Intermediate", desc: "Covered some subjects" },
  { key: "advanced", label: "Advanced", desc: "Ready for mock exams" },
];
const SUBJECT_OPTIONS = [
  "Pakistan Affairs",
  "Current Affairs",
  "English Essay",
  "English Precis & Composition",
  "General Science & Ability",
  "Islamic Studies",
  "International Relations",
  "Governance & Public Policy",
];
const SCHEDULES = [
  { key: "morning", label: "Morning", icon: "wb_sunny" },
  { key: "afternoon", label: "Afternoon", icon: "wb_twilight" },
  { key: "evening", label: "Evening", icon: "nights_stay" },
  { key: "night", label: "Night", icon: "bedtime" },
];

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [year, setYear] = useState<number | null>(null);
  const [hours, setHours] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [covered, setCovered] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function next() {
    if (step === 5) {
      setStep(6);
      setGenerating(true);
      setSaveError(null);

      if (user) {
        try {
          await setDoc(
            doc(db, "users", user.uid),
            {
              onboarding: {
                completed: true,
                targetYear: year,
                dailyHours: hours,
                level,
                completedSubjects: covered,
                schedulePref: schedule,
              },
              updatedAt: new Date(),
            },
            { merge: true }
          );
        } catch (err) {
          console.error("Failed to save onboarding data:", err);
          setSaveError("Couldn't save your preferences, but you can continue — you can update these later in Settings.");
        }
      }

      setTimeout(() => router.push("/dashboard"), 1800);
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }
  function toggleSubject(s: string) {
    setCovered((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  const canContinue =
    (step === 1 && year !== null) ||
    (step === 2 && hours !== null) ||
    (step === 3 && level !== null) ||
    step === 4 ||
    (step === 5 && schedule !== null);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-lg">
        {step <= 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2 text-xs text-on-surface-variant">
              <span>Step {step} of 5</span>
              <span>{Math.round((step / 5) * 100)}%</span>
            </div>
            <ProgressBar value={(step / 5) * 100} />
          </div>
        )}

        <Card className="p-8">
          {step === 1 && (
            <Step title="What year are you targeting for your CSS attempt?">
              <div className="grid grid-cols-2 gap-3">
                {YEARS.map((y) => (
                  <OptionCard key={y} active={year === y} onClick={() => setYear(y)}>
                    <span className="text-lg font-semibold">{y}</span>
                  </OptionCard>
                ))}
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step title="How many hours can you study daily?">
              <div className="grid grid-cols-2 gap-3">
                {HOURS.map((h) => (
                  <OptionCard key={h} active={hours === h} onClick={() => setHours(h)}>
                    <span className="text-sm font-medium">{h}</span>
                  </OptionCard>
                ))}
              </div>
            </Step>
          )}

          {step === 3 && (
            <Step title="What's your current preparation level?">
              <div className="space-y-3">
                {LEVELS.map((l) => (
                  <OptionCard key={l.key} active={level === l.key} onClick={() => setLevel(l.key)} className="text-left flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{l.label}</p>
                      <p className="text-xs text-on-surface-variant">{l.desc}</p>
                    </div>
                    {level === l.key && <Icon name="check_circle" filled className="text-primary" />}
                  </OptionCard>
                ))}
              </div>
            </Step>
          )}

          {step === 4 && (
            <Step title="Which subjects have you already covered?" subtitle="Select all that apply — optional.">
              <div className="flex flex-wrap gap-2">
                {SUBJECT_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSubject(s)}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-sm font-medium border transition-colors",
                      covered.includes(s)
                        ? "bg-primary text-on-primary border-primary"
                        : "border-outline-variant text-on-surface hover:bg-surface-container"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Step>
          )}

          {step === 5 && (
            <Step title="Preferred study schedule?">
              <div className="grid grid-cols-2 gap-3">
                {SCHEDULES.map((s) => (
                  <OptionCard key={s.key} active={schedule === s.key} onClick={() => setSchedule(s.key)} className="flex flex-col items-center gap-2 py-6">
                    <Icon name={s.icon} filled={schedule === s.key} className="text-[24px]" />
                    <span className="text-sm font-medium">{s.label}</span>
                  </OptionCard>
                ))}
              </div>
            </Step>
          )}

          {step === 6 && (
            <div className="flex flex-col items-center text-center py-8">
              <div className="h-12 w-12 rounded-full border-4 border-primary-container border-t-primary animate-spin mb-6" />
              <h2 className="text-lg font-semibold text-on-surface">Saving your preferences...</h2>
              <p className="mt-2 text-sm text-on-surface-variant">This usually takes a few seconds.</p>
              {saveError && <p className="mt-3 text-xs text-error max-w-xs">{saveError}</p>}
            </div>
          )}

          {step <= 5 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={back}
                disabled={step === 1}
                className="text-sm font-medium text-on-surface-variant disabled:opacity-0 hover:text-on-surface"
              >
                Back
              </button>
              <Button onClick={next} disabled={!canContinue}>
                {step === 5 ? "Finish" : "Continue"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-lg font-bold text-on-surface">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function OptionCard({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-3 transition-colors",
        active
          ? "border-primary bg-primary-container/10 text-primary"
          : "border-outline-variant text-on-surface hover:bg-surface-container",
        className
      )}
    >
      {children}
    </button>
  );
}