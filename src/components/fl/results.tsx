import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleSlash,
  Copy,
  Download,
  FileCheck2,
  FileX2,
  Gauge,
  History,
  Lightbulb,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalysisResult } from "@/lib/fraudlens/analyze.functions";
import {
  Card,
  CardHead,
  Expandable,
  InfoTip,
  RiskBadge,
  RiskScale,
  ScoreRing,
  SyntheticTag,
  levelStyle,
  type Level,
} from "./ui";
import { cn } from "@/lib/utils";

export type Ok = Extract<AnalysisResult, { ok: true }>;

export function ScorePanel({ r }: { r: Ok }) {
  return (
    <Card>
      <CardHead
        title="Risk Analysis"
        icon={<Gauge className="h-4 w-4" />}
        right={
          <span className="text-xs text-muted-foreground">
            {r.transaction.transaction_id} · {new Date(r.analyzedAt).toLocaleTimeString()}
          </span>
        }
      />
      <div className="flex flex-col items-center gap-6 p-5 sm:flex-row">
        <ScoreRing score={r.rules.score} level={r.rules.level} />
        <div className="w-full flex-1 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Risk level
            </p>
            <div className="mt-1 flex items-center gap-2">
              <RiskBadge level={r.rules.level} score={r.rules.score} className="text-sm" />
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Reason codes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {r.report.reason_codes.length ? (
                r.report.reason_codes.map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[11px]"
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No rules triggered</span>
              )}
            </div>
          </div>
          <RiskScale score={r.rules.score} />
        </div>
      </div>
    </Card>
  );
}

export function EvidencePanel({ r }: { r: Ok }) {
  return (
    <Card>
      <CardHead
        title="Supporting Evidence"
        icon={<ListChecks className="h-4 w-4" />}
        sub="Each signal is produced by the deterministic rule engine"
      />
      <div className="space-y-2 p-4">
        {r.rules.signals.length === 0 && (
          <p className="px-1 py-3 text-sm text-muted-foreground">
            No configured risk rules were triggered for this transaction.
          </p>
        )}
        {r.rules.signals.map((s) => (
          <Expandable
            key={s.code}
            summary={
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">
                  {s.label}{" "}
                  <span className="ml-1 font-mono text-[11px] text-muted-foreground">{s.code}</span>
                </span>
                <span className="font-mono text-sm tabular-nums text-primary">
                  +{s.contribution}
                </span>
              </div>
            }
          >
            <dl className="grid grid-cols-[110px_1fr] gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Signal</dt>
              <dd>{s.label}</dd>
              <dt className="text-muted-foreground">Evidence</dt>
              <dd>{s.evidence}</dd>
              <dt className="text-muted-foreground">Contribution</dt>
              <dd className="tabular-nums">+{s.contribution} points</dd>
              <dt className="text-muted-foreground">Source</dt>
              <dd>Deterministic Rule Engine</dd>
            </dl>
          </Expandable>
        ))}
      </div>
    </Card>
  );
}

export function ExplanationFlow({ r }: { r: Ok }) {
  const steps = [
    {
      t: "Transaction",
      d: `${r.transaction.currency} ${r.transaction.amount.toLocaleString("en-IN")} · ${r.transaction.merchant_category} · ${r.transaction.country}`,
    },
    {
      t: "Detected Signals",
      d: r.rules.signals.length
        ? `${r.rules.signals.length} signal(s): ${r.rules.signals.map((s) => s.label).join(", ")}`
        : "No signals",
    },
    { t: "Risk Score", d: `${r.rules.level} — ${r.rules.score}/100` },
    {
      t: "Historical Context",
      d: r.similar[0]
        ? `Closest: ${r.similar[0].case_id} (${Math.round(r.similar[0].similarity * 100)}%)`
        : "None",
    },
    {
      t: "Narrative",
      d: r.narrative.source === "ai" ? "AI-generated from evidence" : "Deterministic fallback",
    },
  ];
  return (
    <Card>
      <CardHead title="Why was this transaction flagged?" icon={<Workflow className="h-4 w-4" />} />
      <ol className="grid gap-2 p-4 md:grid-cols-5">
        {steps.map((s, i) => (
          <li key={s.t} className="relative rounded-lg border border-border bg-muted/40 p-3">
            <span className="text-[11px] font-medium text-primary">Step {i + 1}</span>
            <p className="text-sm font-semibold">{s.t}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
            {i < steps.length - 1 && (
              <ArrowRight
                className="absolute -right-3 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-card text-muted-foreground md:block"
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function SimilarCases({ r }: { r: Ok }) {
  const [sort, setSort] = useState<"similarity" | "amount">("similarity");
  const [open, setOpen] = useState<string | null>(null);
  const list = [...r.similar].sort((a, b) =>
    sort === "similarity" ? b.similarity - a.similarity : b.amount - a.amount,
  );
  return (
    <Card>
      <CardHead
        title="Similar Historical Cases"
        icon={<History className="h-4 w-4" />}
        sub="Cosine similarity over transaction feature vectors, computed server-side"
        right={
          <div className="flex items-center gap-2">
            <SyntheticTag label="Synthetic historical cases" />
            <label className="sr-only" htmlFor="sort">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-md border border-input bg-card px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="similarity">Sort: similarity</option>
              <option value="amount">Sort: amount</option>
            </select>
          </div>
        }
      />
      <div className="grid gap-3 p-4 md:grid-cols-3">
        {list.map((c) => (
          <article
            key={c.case_id}
            className="rounded-lg border border-border p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-medium">{c.case_id}</span>
              <RiskBadge level={c.risk_level as Level} />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Similarity</span>
              <span className="text-xl font-semibold tabular-nums">
                {Math.round(c.similarity * 100)}%
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-teal"
                style={{ width: `${c.similarity * 100}%` }}
              />
            </div>
            <ul className="mt-3 flex flex-wrap gap-1">
              {c.signals.length ? (
                c.signals.map((s) => (
                  <li key={s} className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
                    {s}
                  </li>
                ))
              ) : (
                <li className="text-[11px] text-muted-foreground">No risk signals</li>
              )}
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>
            <button
              type="button"
              onClick={() => setOpen(open === c.case_id ? null : c.case_id)}
              aria-expanded={open === c.case_id}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Details{" "}
              <ChevronDown
                className={cn("h-3 w-3 transition-transform", open === c.case_id && "rotate-180")}
              />
            </button>
            {open === c.case_id && (
              <dl className="mt-2 grid grid-cols-2 gap-1 text-xs">
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="tabular-nums">INR {c.amount.toLocaleString("en-IN")}</dd>
                <dt className="text-muted-foreground">Category</dt>
                <dd>{c.category}</dd>
                <dt className="text-muted-foreground">Country</dt>
                <dd>{c.country}</dd>
                <dt className="text-muted-foreground">Raw score</dt>
                <dd className="font-mono">{c.similarity.toFixed(3)}</dd>
              </dl>
            )}
          </article>
        ))}
      </div>
    </Card>
  );
}

export function NarrativeCard({ r }: { r: Ok }) {
  const ai = r.narrative.source === "ai";
  return (
    <Card>
      <CardHead
        title="AI Risk Narrative"
        icon={<Sparkles className="h-4 w-4" />}
        right={
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-[11px] font-medium",
                ai
                  ? "border-primary/30 bg-accent text-accent-foreground"
                  : "border-warning/40 bg-warning/10 text-foreground",
              )}
            >
              {ai ? "AI-generated" : "Deterministic fallback"}
            </span>
            <InfoTip text="AI-generated explanations are based on available transaction evidence and retrieved synthetic cases." />
          </div>
        }
      />
      <div className="p-5">
        {!ai && r.narrative.fallbackReason && (
          <p className="mb-3 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
            {r.narrative.fallbackReason} FraudLens generated a deterministic fallback report.
          </p>
        )}
        <p className="leading-relaxed">{r.narrative.text}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          {ai
            ? `Model: ${r.narrative.model} · attempts: ${r.narrative.attempts}`
            : `Attempts before fallback: ${r.narrative.attempts}`}
        </p>
      </div>
    </Card>
  );
}

export function ActionCard({ r }: { r: Ok }) {
  const s = levelStyle[r.rules.level];
  return (
    <Card>
      <CardHead title="Recommended Review Action" icon={<Lightbulb className="h-4 w-4" />} />
      <div className="p-5">
        <p className={cn("text-base font-semibold", s.text)}>{r.report.recommended_action}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Decision support only. FraudLens does not approve, reject, block, or accuse. Final
          decisions rest with a human reviewer.
        </p>
      </div>
    </Card>
  );
}

export function SecuritySummary({ r }: { r: Ok }) {
  const f = r.injection.findings;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        f.length ? "border-warning/40 bg-warning/5" : "border-success/30 bg-success/5",
      )}
    >
      {f.length ? (
        <ShieldAlert className="h-5 w-5 shrink-0 text-warning" />
      ) : (
        <ShieldCheck className="h-5 w-5 shrink-0 text-success" />
      )}
      <div className="text-sm">
        <p className="font-semibold">
          {f.length
            ? `Warning — ${f.length} instruction-like pattern(s) detected`
            : "Protected — no instruction-like content detected"}
        </p>
        <p className="text-muted-foreground">
          {f.length
            ? `Found in: ${[...new Set(f.map((x) => x.field))].join(", ")}. The content was redacted before reaching the AI and the transaction was evaluated normally.`
            : "Transaction fields were treated as untrusted data, not instructions."}
        </p>
      </div>
    </div>
  );
}

export function StageList({ r }: { r: Ok }) {
  const icon = (s: string) =>
    s === "done" ? (
      <CheckCircle2 className="h-4 w-4 text-success" />
    ) : s === "warning" ? (
      <AlertTriangle className="h-4 w-4 text-warning" />
    ) : s === "fallback" ? (
      <AlertTriangle className="h-4 w-4 text-warning" />
    ) : (
      <CircleSlash className="h-4 w-4 text-muted-foreground" />
    );
  return (
    <ol className="space-y-1.5">
      {r.stages.map((s) => (
        <li key={s.key} className="flex items-center gap-2 text-sm">
          {icon(s.status)}
          <span className="flex-1">{s.label}</span>
          {s.note && (
            <span className="hidden text-xs text-muted-foreground sm:inline">{s.note}</span>
          )}
          <span className="w-14 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
            {s.ms} ms
          </span>
        </li>
      ))}
    </ol>
  );
}

export function EvalBars({ r }: { r: Ok }) {
  if (!r.evaluation.available)
    return (
      <p className="text-sm text-muted-foreground">
        {r.evaluation.reason ?? "Evaluation not available for this analysis."}
      </p>
    );
  return (
    <div className="space-y-4">
      {r.evaluation.metrics.map((m) => (
        <div key={m.key}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">{m.label}</span>
            <span className="tabular-nums font-semibold">{m.score}/10</span>
          </div>
          <div
            className="mt-1 h-2 rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={m.score}
            aria-valuemin={0}
            aria-valuemax={10}
            aria-label={m.label}
          >
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${m.score * 10}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{m.explanation}</p>
        </div>
      ))}
    </div>
  );
}

function YamlView({ text }: { text: string }) {
  return (
    <pre className="max-h-[420px] overflow-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
      {text.split("\n").map((line, i) => {
        const m = line.match(/^(\s*-?\s*)([\w_]+)(:)(.*)$/);
        return (
          <div key={i} className="flex">
            <span className="mr-4 w-6 select-none text-right text-muted-foreground/60">
              {i + 1}
            </span>
            {m ? (
              <span>
                {m[1]}
                <span className="text-primary">{m[2]}</span>
                {m[3]}
                <span className={/^\s*"/.test(m[4]!) ? "text-teal" : "text-risk-high"}>{m[4]}</span>
              </span>
            ) : (
              <span>{line}</span>
            )}
          </div>
        );
      })}
    </pre>
  );
}

export function ReportViewer({ r }: { r: Ok }) {
  const copy = async () => {
    await navigator.clipboard.writeText(r.reportYaml);
    toast.success("YAML report copied to clipboard");
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([r.reportYaml], { type: "text/yaml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.transaction.transaction_id}-report.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Card>
      <CardHead
        title="Structured Risk Report"
        icon={<FileCheck2 className="h-4 w-4" />}
        right={
          r.validation.valid ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
              <FileCheck2 className="h-3 w-3" />
              Schema Valid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
              <FileX2 className="h-3 w-3" />
              Validation Failed
            </span>
          )
        }
      />
      <Tabs defaultValue="overview" className="p-4">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="yaml">YAML</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="cases">Retrieved Cases</TabsTrigger>
          <TabsTrigger value="eval">Evaluation</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-3">
          <div className="grid gap-4 md:grid-cols-2">
            <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
              <dt className="text-muted-foreground">Transaction</dt>
              <dd className="font-mono">{r.report.transaction_id}</dd>
              <dt className="text-muted-foreground">Risk</dt>
              <dd>
                <RiskBadge level={r.report.risk_level} score={r.report.risk_score} />
              </dd>
              <dt className="text-muted-foreground">Narrative source</dt>
              <dd>
                {r.report.narrative_source === "ai" ? "AI-generated" : "Deterministic fallback"}
              </dd>
              <dt className="text-muted-foreground">Injection detected</dt>
              <dd>{r.report.prompt_injection_detected ? "Yes" : "No"}</dd>
              <dt className="text-muted-foreground">Action</dt>
              <dd>{r.report.recommended_action}</dd>
            </dl>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pipeline stages
              </p>
              <StageList r={r} />
            </div>
          </div>
          {!r.validation.valid && (
            <ul className="mt-3 list-inside list-disc text-xs text-destructive">
              {r.validation.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </TabsContent>
        <TabsContent value="yaml" className="pt-3">
          <div className="mb-2 flex justify-end gap-2">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
            <button
              onClick={download}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
          <YamlView text={r.reportYaml} />
        </TabsContent>
        <TabsContent value="evidence" className="pt-3">
          <ul className="space-y-2 text-sm">
            {r.report.evidence.length ? (
              r.report.evidence.map((e) => (
                <li key={e} className="rounded-md border border-border px-3 py-2">
                  {e}
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">No evidence items — no rules triggered.</li>
            )}
          </ul>
        </TabsContent>
        <TabsContent value="cases" className="pt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Case</th>
                  <th className="pr-4 font-medium">Similarity</th>
                  <th className="pr-4 font-medium">Risk</th>
                  <th className="font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {r.similar.map((c) => (
                  <tr key={c.case_id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 font-mono">{c.case_id}</td>
                    <td className="pr-4 tabular-nums">{c.similarity.toFixed(3)}</td>
                    <td className="pr-4">
                      <RiskBadge level={c.risk_level as Level} />
                    </td>
                    <td className="text-muted-foreground">{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="eval" className="pt-3">
          <EvalBars r={r} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
