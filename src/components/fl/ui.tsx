import { useState, type ReactNode } from "react";
import { ChevronDown, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type Level = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const levelStyle: Record<Level, { text: string; bg: string; stroke: string; dot: string }> =
  {
    LOW: {
      text: "text-success",
      bg: "bg-success/10 border-success/30",
      stroke: "stroke-success",
      dot: "bg-success",
    },
    MEDIUM: {
      text: "text-risk-medium",
      bg: "bg-risk-medium/10 border-risk-medium/30",
      stroke: "stroke-risk-medium",
      dot: "bg-risk-medium",
    },
    HIGH: {
      text: "text-risk-high",
      bg: "bg-risk-high/10 border-risk-high/30",
      stroke: "stroke-risk-high",
      dot: "bg-risk-high",
    },
    CRITICAL: {
      text: "text-destructive",
      bg: "bg-destructive/10 border-destructive/30",
      stroke: "stroke-destructive",
      dot: "bg-destructive",
    },
  };

export function RiskBadge({
  level,
  score,
  className,
}: {
  level: Level;
  score?: number;
  className?: string;
}) {
  const s = levelStyle[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold tracking-wide",
        s.bg,
        s.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden />
      {level}
      {score !== undefined && <span className="font-medium text-foreground/70">— {score}/100</span>}
    </span>
  );
}

export function ScoreRing({
  score,
  level,
  size = 148,
}: {
  score: number;
  level: Level;
  size?: number;
}) {
  const r = 42,
    c = 2 * Math.PI * r;
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Risk score ${score} out of 100, ${level}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" className="stroke-muted" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          className={cn(levelStyle[level].stroke, "transition-all duration-700")}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tabular-nums">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export function RiskScale({
  score,
  bands,
}: {
  score: number;
  bands?: { level: Level; min: number; max: number }[];
}) {
  const b =
    bands ??
    ([
      { level: "LOW", min: 0, max: 29 },
      { level: "MEDIUM", min: 30, max: 59 },
      { level: "HIGH", min: 60, max: 79 },
      { level: "CRITICAL", min: 80, max: 100 },
    ] as { level: Level; min: number; max: number }[]);
  return (
    <div className="w-full">
      <div className="relative flex h-2 overflow-hidden rounded-full">
        {b.map((x) => (
          <div
            key={x.level}
            className={cn(levelStyle[x.level].dot, "opacity-70")}
            style={{ width: `${x.max - x.min + 1}%` }}
          />
        ))}
      </div>
      <div className="relative h-3">
        <div
          className="absolute -top-1 h-3 w-0.5 -translate-x-1/2 rounded bg-foreground"
          style={{ left: `${Math.min(score, 99.5)}%` }}
        />
      </div>
      <div className="flex text-[11px] text-muted-foreground">
        {b.map((x) => (
          <span key={x.level} style={{ width: `${x.max - x.min + 1}%` }}>
            {x.level}{" "}
            <span className="tabular-nums">
              {x.min}–{x.max}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
export function CardHead({
  title,
  icon,
  right,
  sub,
}: {
  title: string;
  icon?: ReactNode;
  right?: ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-3.5">
      <div className="flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function PageHeader({
  crumb,
  title,
  desc,
  right,
}: {
  crumb: string;
  title: string;
  desc?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          FraudLens <span aria-hidden>/</span> <span className="text-foreground">{crumb}</span>
        </nav>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {desc && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
        {icon}
      </div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SyntheticTag({ label = "Synthetic data" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-teal/30 bg-teal/10 px-2 py-0.5 text-[11px] font-medium text-teal">
      {label}
    </span>
  );
}

export function InfoTip({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="More information"
            className="rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Expandable({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border bg-card transition-colors hover:border-primary/30">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      >
        <div className="min-w-0 flex-1">{summary}</div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && <div className="border-t border-border px-4 py-3 text-sm">{children}</div>}
    </div>
  );
}

export function Disclosure() {
  return (
    <div className="border-b border-teal/20 bg-teal/5 px-4 py-1.5 text-center text-xs text-foreground/80">
      <strong className="font-semibold text-teal">Academic prototype · Synthetic data only.</strong>{" "}
      FraudLens is a decision-support demonstration. It does not approve, block, or accuse any
      customer.
    </div>
  );
}
