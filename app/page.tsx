import Link from "next/link";
import { PublicNavbar, PublicFooter } from "@/components/public-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

const FEATURES = [
  {
    icon: "smart_toy",
    title: "AI Mentor",
    body: "A conversational tutor available around the clock — explains concepts, builds study plans, and reviews your quiz mistakes in plain language.",
  },
  {
    icon: "history_edu",
    title: "Past Papers & Analysis",
    body: "Two decades of past papers per subject, solved versions, and AI-identified frequently repeated questions so you study what matters most.",
  },
  {
    icon: "monitoring",
    title: "Progress Tracking",
    body: "A live CSS Readiness Score built from your quiz accuracy, syllabus coverage, consistency, and mock exam performance.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tell us where you're starting",
    body: "A short onboarding questionnaire covers your target attempt year, available study hours, and current level.",
  },
  {
    n: "02",
    title: "Get a personalized roadmap",
    body: "AI generates a daily and weekly plan across every compulsory and optional subject you choose.",
  },
  {
    n: "03",
    title: "Study, quiz, and track readiness",
    body: "Work through notes, past papers, and quizzes while your Readiness Score updates in real time.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-container/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-28 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container text-on-secondary-container px-3 py-1 text-xs font-medium mb-5">
              <Icon name="auto_awesome" className="text-[16px]" />
              Pakistan&apos;s first AI-powered CSS academy
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-on-surface leading-[1.08]">
              Prepare for CSS with a personal AI mentor in your browser
            </h1>
            <p className="mt-5 text-lg text-on-surface-variant max-w-xl">
              Structured subject content, past papers with AI analysis, adaptive
              quizzes, and a study planner built around your own readiness —
              no installs, no app store, just a browser.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/signup">
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-on-surface hover:text-primary inline-flex items-center gap-1">
                See Pricing
                <Icon name="arrow_forward" className="text-[16px]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container/15 text-primary mb-4">
                <Icon name={f.icon} filled />
              </div>
              <h3 className="font-semibold text-lg text-on-surface">{f.title}</h3>
              <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-on-surface text-center">How it works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <span className="text-4xl font-bold text-primary-container">{s.n}</span>
              <h3 className="mt-3 font-semibold text-on-surface">{s.title}</h3>
              <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof placeholder */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-xl font-semibold text-on-surface text-center mb-8">
            Trusted by aspirants preparing for CSS across Pakistan
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  &ldquo;Placeholder testimonial from a beta CSS aspirant will go
                  here once collected.&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-secondary-container" />
                  <div>
                    <p className="text-sm font-medium text-on-surface">Aspirant {i}</p>
                    <p className="text-xs text-on-surface-variant">CSS 2026 attempt</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-on-surface">
          Start your CSS preparation today — free
        </h2>
        <p className="mt-3 text-on-surface-variant">7-day AI Mentor trial, no credit card required.</p>
        <div className="mt-6">
          <Link href="/signup">
            <Button size="lg">Get Started Free</Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
