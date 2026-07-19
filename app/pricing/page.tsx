"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicNavbar, PublicFooter } from "@/components/public-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    tagline: "Explore the platform",
    cta: "Get Started",
    highlight: false,
    features: [
      { label: "Study materials, books, PDFs", included: true },
      { label: "Subject overview", included: true },
      { label: "Limited quizzes", included: true },
      { label: "AI Mentor — 7-day trial", included: true },
      { label: "Basic study roadmap", included: true },
      { label: "Weak-area analysis", included: false },
      { label: "Mock exams", included: false },
      { label: "Video lectures", included: false },
    ],
  },
  {
    name: "Pro",
    price: "PKR 1,499",
    period: "/mo",
    tagline: "For serious aspirants",
    cta: "Upgrade to Pro",
    highlight: true,
    features: [
      { label: "Study materials, books, PDFs", included: true },
      { label: "Subject overview", included: true },
      { label: "Unlimited quizzes", included: true },
      { label: "AI Mentor — unlimited", included: true },
      { label: "Personalized AI roadmap", included: true },
      { label: "Weak-area analysis", included: true },
      { label: "Mock exams", included: true },
      { label: "AI-generated assignments", included: true },
      { label: "Video lectures", included: false },
    ],
  },
  {
    name: "Elite",
    price: "PKR 2,999",
    period: "/mo",
    tagline: "The full academy",
    cta: "Upgrade to Elite",
    highlight: false,
    features: [
      { label: "Everything in Pro", included: true },
      { label: "AI Mentor — unlimited + priority", included: true },
      { label: "Video lectures", included: true },
      { label: "Premium notes", included: true },
      { label: "Community access (coming soon)", included: true },
    ],
  },
];

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Pro and Elite are billed monthly with no long-term commitment — cancel anytime from Account → Subscription and you'll retain access until the end of your billing period.",
  },
  {
    q: "What happens after my AI Mentor trial ends?",
    a: "Starter users get 7 days of full AI Mentor access. After that, AI Mentor access is limited until you upgrade to Pro or Elite.",
  },
  {
    q: "Do you support local payment methods?",
    a: "Yes — we support JazzCash and Easypaisa for Pakistani users, alongside card payments via Stripe.",
  },
  {
    q: "Is there a difference in content quality between tiers?",
    a: "No — all study materials, books, and PDFs are available on every tier. Paid tiers unlock unlimited quizzes, mock exams, deeper AI analysis, and (on Elite) video lectures.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <PublicNavbar />

      <section className="max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-on-surface">Simple, transparent pricing</h1>
        <p className="mt-3 text-on-surface-variant max-w-xl mx-auto">
          Start free, upgrade when you&apos;re ready for unlimited quizzes, mock exams, and deeper AI analysis.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-20 w-full">
        <div className="grid gap-6 md:grid-cols-3 items-start">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "p-6 flex flex-col relative",
                tier.highlight && "border-2 border-primary shadow-lg md:-translate-y-2"
              )}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary text-on-primary text-xs font-semibold px-3 py-1">
                  Most Popular
                </span>
              )}
              <h3 className="font-semibold text-lg text-on-surface">{tier.name}</h3>
              <p className="text-sm text-on-surface-variant">{tier.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-on-surface">{tier.price}</span>
                <span className="text-sm text-on-surface-variant">{tier.period}</span>
              </div>
              <Link href="/signup" className="mt-6">
                <Button
                  variant={tier.highlight ? "primary" : "outline"}
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </Link>
              <ul className="mt-6 space-y-3 text-sm">
                {tier.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2">
                    <Icon
                      name={f.included ? "check_circle" : "cancel"}
                      filled
                      className={cn(
                        "text-[18px] mt-0.5",
                        f.included ? "text-primary" : "text-outline"
                      )}
                    />
                    <span className={cn(!f.included && "text-on-surface-variant")}>{f.label}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 md:px-6 pb-24 w-full">
        <h2 className="text-2xl font-bold text-on-surface text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <Card key={item.q} className="overflow-hidden">
              <button
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-medium text-on-surface text-sm">{item.q}</span>
                <Icon
                  name="expand_more"
                  className={cn("transition-transform text-on-surface-variant", openFaq === i && "rotate-180")}
                />
              </button>
              {openFaq === i && (
                <p className="px-5 pb-4 text-sm text-on-surface-variant leading-relaxed">{item.a}</p>
              )}
            </Card>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
