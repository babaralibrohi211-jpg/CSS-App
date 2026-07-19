import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)]",
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "primary" | "secondary" | "tertiary" | "error";
}) {
  const toneClasses: Record<string, string> = {
    neutral: "bg-surface-container text-on-surface-variant",
    primary: "bg-primary-container/20 text-primary",
    secondary: "bg-secondary-container text-on-secondary-container",
    tertiary: "bg-tertiary-container/20 text-tertiary",
    error: "bg-error-container text-on-error-container",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export function ProgressBar({
  value,
  className,
  trackClassName,
}: {
  value: number;
  className?: string;
  trackClassName?: string;
}) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-surface-container-high overflow-hidden", trackClassName)}>
      <div
        className={cn("h-full rounded-full bg-primary transition-all", className)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-surface-container-high"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="stroke-primary transition-all duration-700 ease-out"
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-on-surface">{label ?? `${value}%`}</span>
        {sublabel && <span className="text-xs text-on-surface-variant">{sublabel}</span>}
      </div>
    </div>
  );
}
