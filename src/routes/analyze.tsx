import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FlaskConical,
  Loader2,
  Play,
  RotateCcw,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useFraudLens } from "@/lib/fraudlens/store";
import { SAMPLES, TransactionSchema } from "@/lib/fraudlens/engine";
import { Card, CardHead, EmptyState, PageHeader, SyntheticTag } from "@/components/fl/ui";
import {
  ActionCard,
  EvidencePanel,
  ExplanationFlow,
  NarrativeCard,
  ReportViewer,
  ScorePanel,
  SecuritySummary,
  SimilarCases,
} from "@/components/fl/results";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Transaction — FraudLens" },
      {
        name: "description",
        content:
          "Run a synthetic transaction through the FraudLens risk pipeline: rules, case retrieval, AI narrative and validated report.",
      },
      { property: "og:title", content: "Analyze Transaction — FraudLens" },
      { property: "og:description", content: "Evidence-grounded transaction risk analysis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyzePage,
});

const SAMPLE_ICONS = { normal: ShieldCheck, suspicious: ScanSearch, injection: ShieldAlert };

function JsonEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const gutter = useRef<HTMLDivElement>(null);
  const lines = value.split("\n").length;
  return (
    <div className="flex h-[340px] overflow-hidden rounded-lg border border-input bg-card focus-within:ring-2 focus-within:ring-ring">
      <div
        ref={gutter}
        aria-hidden
        className="select-none overflow-hidden border-r border-border bg-muted/50 px-2 py-3 text-right font-mono text-xs leading-5 text-muted-foreground/70"
      >
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        aria-label="Transaction JSON"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
        }}
        className="flex-1 resize-none bg-transparent px-3 py-3 font-mono text-xs leading-5 outline-none"
      />
    </div>
  );
}

function AnalyzePage() {
  const { raw, setRaw, result, error, running, run } = useFraudLens();

  const check = useMemo(() => {
    try {
      const v = TransactionSchema.safeParse(JSON.parse(raw));
      return v.success
        ? { ok: true as const, msg: "Valid transaction schema" }
        : { ok: false as const, msg: v.error.issues[0]?.message ?? "Invalid" };
    } catch {
      return { ok: false as const, msg: "Transaction format is invalid (JSON syntax error)." };
    }
  }, [raw]);

  return (
    <>
      <PageHeader
        crumb="Analyze"
        title="Transaction Analysis"
        desc="Submit a synthetic transaction to the FraudLens pipeline. Every result shown is produced by the server-side engine."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHead
              title="Transaction Input"
              right={
                <span className="font-mono text-[11px] text-muted-foreground">
                  application/json
                </span>
              }
            />
            <div className="space-y-3 p-4">
              <JsonEditor value={raw} onChange={setRaw} />
              <p
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  check.ok ? "text-success" : "text-destructive",
                )}
                role="status"
              >
                {check.ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5" />
                )}
                {check.msg}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => run()}
                  disabled={running}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {running ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {running ? "Analyzing…" : "Analyze Transaction"}
                </button>
                <button
                  onClick={() => setRaw(JSON.stringify(SAMPLES.suspicious.txn, null, 2))}
                  className="rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Load Sample
                </button>
                <button
                  onClick={() => setRaw("{\n  \n}")}
                  aria-label="Clear input"
                  className="rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Demo samples</h2>
              <SyntheticTag />
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {(Object.keys(SAMPLES) as (keyof typeof SAMPLES)[]).map((k) => {
                const Icon = SAMPLE_ICONS[k];
                return (
                  <button
                    key={k}
                    disabled={running}
                    onClick={() => run(JSON.stringify(SAMPLES[k].txn, null, 2))}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:shadow-sm disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{SAMPLES[k].title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {SAMPLES[k].subtitle} · synthetic
                      </span>
                    </span>
                    <Play className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          {error && !running && (
            <Card className="border-destructive/30">
              <div className="flex gap-3 p-5">
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{error.title}</p>
                  <p className="text-sm text-muted-foreground">{error.message}</p>
                  {error.details?.length ? (
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Technical details
                      </summary>
                      <ul className="mt-2 space-y-1 rounded-md bg-muted p-3 font-mono">
                        {error.details.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </div>
              </div>
            </Card>
          )}
          {running && (
            <Card>
              <div
                className="flex flex-col items-center px-6 py-14 text-center"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 font-semibold">Analyzing transaction…</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Validation, injection inspection, risk rules, retrieval, narrative generation,
                  report validation and evaluation run on the server. Per-stage timings appear when
                  complete.
                </p>
              </div>
            </Card>
          )}
          {!running && !result && !error && (
            <Card>
              <EmptyState
                icon={<FlaskConical className="h-5 w-5" />}
                title="Ready to analyze"
                desc="Enter a transaction or choose a synthetic sample to begin."
              />
            </Card>
          )}
          {!running && result && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    <strong>Persisted to Database:</strong> Transaction{" "}
                    <code>{result.transaction.transaction_id}</code> recorded in Investigation
                    Queue, Evaluations, and Audit Log.
                  </span>
                </div>
                <Link
                  to="/"
                  className="font-semibold underline hover:text-emerald-950 dark:hover:text-emerald-100"
                >
                  View in Investigation Queue →
                </Link>
              </div>
              <SecuritySummary r={result} />
              <ScorePanel r={result} />
              <ExplanationFlow r={result} />
              <div className="grid gap-6 xl:grid-cols-2">
                <EvidencePanel r={result} />
                <div className="space-y-6">
                  <NarrativeCard r={result} />
                  <ActionCard r={result} />
                </div>
              </div>
              <SimilarCases r={result} />
              <ReportViewer r={result} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
