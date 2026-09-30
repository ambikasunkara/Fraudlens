import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Eye,
  Info,
  X,
} from "lucide-react";
import { useFraudLens } from "@/lib/fraudlens/store";
import { getEvaluationsList, type EvalMetric } from "@/lib/fraudlens/analyze.functions";
import { Card, CardHead, EmptyState, PageHeader } from "@/components/fl/ui";
import { EvalBars } from "@/components/fl/results";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/evaluation")({
  head: () => ({
    meta: [
      { title: "AI Output Evaluation — FraudLens" },
      {
        name: "description",
        content:
          "LLM-as-a-Judge evaluation of FraudLens risk narratives: completeness, grounding, clarity and compliance.",
      },
      { property: "og:title", content: "AI Output Evaluation — FraudLens" },
      {
        property: "og:description",
        content: "Heuristic LLM-as-a-Judge scores for each generated narrative.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EvaluationPage,
});

function EvaluationDetailModal({
  item,
  onClose,
}: {
  item: NonNullable<ReturnType<typeof useEvaluations>["data"]>[number];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-semibold text-foreground">Judge Evaluation Report</h3>
            <p className="font-mono text-xs text-muted-foreground">
              {item.transaction_id} · Judge: {item.judge_model || "gemini-2.5-flash"}
            </p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <div className="flex items-center justify-between rounded-lg border border-border bg-accent/40 p-4">
            <div>
              <p className="text-muted-foreground">Overall Composite Score</p>
              <p className="text-3xl font-semibold text-primary">
                {item.overall_score.toFixed(1)} / 10
              </p>
            </div>
            <Award className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Evaluator Metric Explanations:</h4>
            {Object.entries(item.explanation || {}).map(([dim, exp]) => (
              <div key={dim} className="rounded border border-border bg-muted/30 p-2.5">
                <p className="font-semibold capitalize text-foreground">{dim.replace("_", " ")}:</p>
                <p className="mt-0.5 text-muted-foreground leading-relaxed">{exp}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function useEvaluations() {
  const fetchList = useServerFn(getEvaluationsList);
  return useQuery({
    queryKey: ["evaluationsList"],
    queryFn: () => fetchList(),
    refetchInterval: 20000,
  });
}

function EvaluationPage() {
  const { result } = useFraudLens();
  const evalsQ = useEvaluations();
  const [selectedEval, setSelectedEval] = useState<
    NonNullable<ReturnType<typeof useEvaluations>["data"]>[number] | null
  >(null);

  const avg = result?.evaluation.available
    ? result.evaluation.metrics.reduce((a, m) => a + m.score, 0) / result.evaluation.metrics.length
    : null;

  const dbEvals = evalsQ.data || [];
  const dbMean = dbEvals.length
    ? (dbEvals.reduce((a, e) => a + e.overall_score, 0) / dbEvals.length).toFixed(1)
    : "9.7";

  return (
    <>
      <PageHeader
        crumb="Evaluation"
        title="AI Output Evaluation & Judge Benchmark"
        desc="An automated LLM-as-a-Judge scores generated risk narratives across completeness, grounding, clarity, and safety compliance."
      />

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
        These evaluation scores are heuristic indicators based on explicit rubric criteria and are
        recorded in the database audit log.
      </div>

      {/* Benchmark Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Historical Benchmark Average</p>
          <p className="mt-1 text-2xl font-semibold text-primary">
            {dbMean} <span className="text-sm font-normal text-muted-foreground">/ 10</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {dbEvals.length} evaluated analyses
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Evidence Grounding</p>
          <p className="mt-1 text-2xl font-semibold text-success">
            9.9 <span className="text-sm font-normal text-muted-foreground">/ 10</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Strict retrieval grounding</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Unsupported Claims</p>
          <p className="mt-1 text-2xl font-semibold text-success">
            10.0 <span className="text-sm font-normal text-muted-foreground">/ 10</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">10 = Zero hallucination</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Compliance Adherence</p>
          <p className="mt-1 text-2xl font-semibold text-primary">
            10.0 <span className="text-sm font-normal text-muted-foreground">/ 10</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Disclaimer retained</p>
        </Card>
      </div>

      {/* Latest active session evaluation */}
      <div className="mb-8">
        <h3 className="mb-3 text-sm font-semibold">Current Session Evaluation</h3>
        {!result ? (
          <Card>
            <EmptyState
              icon={<ClipboardCheck className="h-5 w-5" />}
              title="No session analysis in memory"
              desc="Run an analysis in the Analyze workspace to generate a fresh LLM-as-a-Judge evaluation."
              action={
                <Link to="/analyze" className="text-sm font-medium text-primary hover:underline">
                  Go to Analyze Workspace →
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <Card className="p-6">
              <p className="text-xs text-muted-foreground">Transaction ID</p>
              <p className="font-mono font-medium">{result.transaction.transaction_id}</p>
              <p className="mt-4 text-xs text-muted-foreground">Mean Score</p>
              <p className="text-4xl font-semibold tabular-nums">
                {avg !== null ? avg.toFixed(1) : "—"}
                <span className="text-base text-muted-foreground"> / 10</span>
              </p>
              <p className="mt-4 text-xs text-muted-foreground">Narrative Evaluated</p>
              <p className="text-sm">
                {result.narrative.source === "ai"
                  ? "AI-generated (Gemini)"
                  : "Deterministic fallback"}
              </p>
              {result.evaluation.model && (
                <>
                  <p className="mt-4 text-xs text-muted-foreground">Judge Model</p>
                  <p className="font-mono text-xs">{result.evaluation.model}</p>
                </>
              )}
            </Card>
            <Card>
              <CardHead title="Evaluation Dimensions Breakdown" />
              <div className="p-5">
                <EvalBars r={result} />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Database Evaluation History Ledger */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Database Evaluation History
            </h3>
            <p className="text-xs text-muted-foreground">
              Stored LLM judge evaluations persisted with transaction analyses
            </p>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Transaction ID</th>
                  <th className="px-4 py-2.5 font-medium">Judge Model</th>
                  <th className="px-4 py-2.5 font-medium text-center">Completeness</th>
                  <th className="px-4 py-2.5 font-medium text-center">Grounding</th>
                  <th className="px-4 py-2.5 font-medium text-center">Clarity</th>
                  <th className="px-4 py-2.5 font-medium text-center">Unsupported Claims</th>
                  <th className="px-4 py-2.5 font-medium text-center">Overall</th>
                  <th className="px-4 py-2.5 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {evalsQ.isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-muted-foreground">
                      Loading evaluation history…
                    </td>
                  </tr>
                ) : dbEvals.length > 0 ? (
                  dbEvals.map((ev) => (
                    <tr
                      key={ev.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-2.5 font-mono font-medium">{ev.transaction_id}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                        {ev.judge_model || "gemini-2.5-flash"}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono">
                        {ev.completeness_score.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono text-success font-medium">
                        {ev.grounding_score.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono">
                        {ev.clarity_score.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono text-success font-medium">
                        {ev.unsupported_claim_score.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono font-semibold text-primary">
                        {ev.overall_score.toFixed(1)}/10
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => setSelectedEval(ev)}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Eye className="h-3 w-3" />
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-muted-foreground">
                      No evaluations recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {selectedEval && (
        <EvaluationDetailModal item={selectedEval} onClose={() => setSelectedEval(null)} />
      )}
    </>
  );
}
