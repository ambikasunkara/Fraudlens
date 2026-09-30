import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  FlaskConical,
  History,
  Layers,
  Play,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useFraudLens } from "@/lib/fraudlens/store";
import { SAMPLES, type RiskLevel } from "@/lib/fraudlens/engine";
import {
  getAnalyticsSummary,
  getTransactionsList,
  updateTransactionStatusAction,
} from "@/lib/fraudlens/analyze.functions";
import { Card, CardHead, EmptyState, RiskBadge, ScoreRing, type Level } from "@/components/fl/ui";
import { SecuritySummary, StageList } from "@/components/fl/results";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FraudLens — Real-Time Transaction Risk Intelligence" },
      {
        name: "description",
        content:
          "Evidence-grounded analysis for faster and more explainable transaction review. Rules, similar-case retrieval and AI narratives.",
      },
      { property: "og:title", content: "FraudLens — Real-Time Transaction Risk Intelligence" },
      {
        property: "og:description",
        content: "Evidence-grounded analysis for faster and more explainable transaction review.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: "#10b981",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

function InvestigationModal({
  item,
  onClose,
  onStatusChange,
}: {
  item: NonNullable<ReturnType<typeof useTransactions>["data"]>[number];
  onClose: () => void;
  onStatusChange: (
    status: "analyzed" | "pending_review" | "reviewed" | "closed" | "escalated",
  ) => void;
}) {
  const an = item.analysis;
  const [copied, setCopied] = useState(false);

  const copyJson = () => {
    void navigator.clipboard.writeText(JSON.stringify(item, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-semibold">{item.transaction_id}</span>
            {an && <RiskBadge level={an.risk_level as Level} score={an.risk_score} />}
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium uppercase text-muted-foreground">
              {item.status.replace("_", " ")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-sm">
          {/* Status triage bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <span className="text-xs font-medium text-muted-foreground">
              Update Investigation Status:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(["analyzed", "pending_review", "reviewed", "escalated", "closed"] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => onStatusChange(st)}
                    className={cn(
                      "rounded px-2.5 py-1 text-xs font-medium transition",
                      item.status === st
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "border border-border bg-card hover:bg-muted",
                    )}
                  >
                    {st.replace("_", " ")}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Key transaction parameters */}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="mt-1 font-mono text-base font-semibold tabular-nums">
                ₹{item.amount.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="mt-1 font-mono text-sm font-medium">{item.customer_id}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Jurisdiction / Device</p>
              <p className="mt-1 text-sm">
                {item.country} · {item.device_new ? "New Device" : "Known Device"}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="mt-1 text-sm font-medium">{item.merchant_category}</p>
            </div>
          </div>

          {/* Narrative & Reasoning */}
          {an && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-accent/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Risk Intelligence Narrative
                </p>
                <p className="mt-2 leading-relaxed text-foreground">{an.narrative}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Source: {an.narrative_source === "ai" ? "Gemini LLM" : "Deterministic Engine"}
                  </span>
                  <span>Pipeline Duration: {an.duration_ms}ms</span>
                </div>
              </div>

              {an.reason_codes.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Contributing Risk Signals
                  </h4>
                  <ul className="space-y-1.5">
                    {an.supporting_evidence.map((ev, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded bg-muted/60 p-2 text-xs"
                      >
                        <span className="font-mono font-medium text-primary">
                          [{an.reason_codes[i] || "SIGNAL"}]
                        </span>
                        <span className="text-foreground">{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {item.memo && (
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Transaction Memo / Payload
              </p>
              <p className="mt-1 rounded border border-border bg-muted/30 p-2 font-mono text-xs">
                {item.memo}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border p-4">
          <button
            onClick={copyJson}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied Record JSON" : "Copy Record JSON"}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function useTransactions(filter?: { status?: string; riskLevel?: string; query?: string }) {
  const fetchList = useServerFn(getTransactionsList);
  return useQuery({
    queryKey: ["transactions", filter],
    queryFn: () => fetchList({ data: filter }),
  });
}

function Dashboard() {
  const { result, run, running } = useFraudLens();
  const nav = useNavigate();
  const qc = useQueryClient();

  const fetchAnalytics = useServerFn(getAnalyticsSummary);
  const analyticsQ = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => fetchAnalytics(),
    refetchInterval: 20000,
  });

  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<
    NonNullable<ReturnType<typeof useTransactions>["data"]>[number] | null
  >(null);

  const txFilter = useMemo(
    () => ({
      status: statusFilter,
      riskLevel: riskFilter,
      query: searchQuery,
    }),
    [statusFilter, riskFilter, searchQuery],
  );

  const transactionsQ = useTransactions(txFilter);
  const updateStatusFn = useServerFn(updateTransactionStatusAction);

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "analyzed" | "pending_review" | "reviewed" | "closed" | "escalated";
    }) => updateStatusFn({ data: { id, status } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["transactions"] });
      void qc.invalidateQueries({ queryKey: ["analyticsSummary"] });
      if (selectedTx) {
        setSelectedTx((prev) => (prev ? { ...prev, status: selectedTx.status } : null));
      }
    },
  });

  const trySample = () => {
    nav({ to: "/analyze" });
    void run(JSON.stringify(SAMPLES.suspicious.txn, null, 2));
  };

  const aData = analyticsQ.data;

  // Chart data formatting
  const riskChartData = useMemo(() => {
    if (!aData?.riskDistribution) return [];
    return (["LOW", "MEDIUM", "HIGH", "CRITICAL"] as RiskLevel[]).map((level) => ({
      name: level,
      count: aData.riskDistribution[level] || 0,
      fill: RISK_COLORS[level],
    }));
  }, [aData]);

  const signalChartData = useMemo(() => {
    if (!aData?.reasonCodeDistribution) return [];
    return Object.entries(aData.reasonCodeDistribution).map(([code, count]) => ({
      name: code.replace("_", " "),
      count,
    }));
  }, [aData]);

  return (
    <>
      {/* Hero section */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-card px-6 py-8 md:px-10 md:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Full-Stack Decision Support System
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-4xl">
              Financial Risk Intelligence & Investigation
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Integrated transaction risk scoring, synthetic case retrieval, prompt-injection
              defense, and persistent audit trail.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Analyze New Transaction <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={trySample}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Play className="h-4 w-4" />
              Try Suspicious Sample
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Database className="h-4 w-4 text-primary" />
            Total Analyzed in Database
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{aData?.totalAnalyzed ?? "—"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {aData?.totalTransactions ?? 0} transaction records tracked
          </p>
        </Card>

        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldAlert className="h-4 w-4 text-warning" />
            High & Critical Risk Rate
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {aData ? `${aData.highRiskPercentage}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {(aData?.riskDistribution.HIGH ?? 0) + (aData?.riskDistribution.CRITICAL ?? 0)}{" "}
            transactions flagged
          </p>
        </Card>

        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BarChart3 className="h-4 w-4 text-primary" />
            Average Risk Score
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {aData?.averageRiskScore ?? 0}
            <span className="text-sm font-normal text-muted-foreground">/100</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Across all evaluated batches</p>
        </Card>

        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            Injections Neutralized
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-success">
            {aData?.securityIncidentsCount ?? 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Protected via Prompt Inspector</p>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <CardHead
            title="Risk Classification Distribution"
            right={<span className="text-xs text-muted-foreground">Live Database Records</span>}
          />
          <div className="mt-4 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={11} stroke="#888888" tickLine={false} />
                <YAxis fontSize={11} stroke="#888888" tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <CardHead
            title="Frequent Risk Signals Triggered"
            right={<span className="text-xs text-muted-foreground">Rules Engine</span>}
          />
          <div className="mt-4 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={signalChartData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 30, bottom: 5 }}
              >
                <XAxis type="number" fontSize={11} stroke="#888888" allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  fontSize={10}
                  stroke="#888888"
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Database Transactions & Investigation Queue */}
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Investigation Queue & Transaction Ledger</h2>
            <p className="text-xs text-muted-foreground">
              Stored transaction analyses with investigation status, audit logs, and risk triage
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                aria-label="Filter transactions"
                placeholder="Search ID, customer…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input bg-card py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="escalated">Escalated</option>
              <option value="reviewed">Reviewed</option>
              <option value="closed">Closed</option>
              <option value="analyzed">Analyzed</option>
            </select>

            <select
              aria-label="Filter by risk level"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Risk Levels</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Transaction ID</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Jurisdiction</th>
                  <th className="px-4 py-3 font-medium">Risk Score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Analyzed At</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactionsQ.isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      Loading database transactions…
                    </td>
                  </tr>
                ) : transactionsQ.data && transactionsQ.data.length > 0 ? (
                  transactionsQ.data.map((tx) => {
                    const an = tx.analysis;
                    return (
                      <tr
                        key={tx.id}
                        className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/40"
                        onClick={() => setSelectedTx(tx)}
                      >
                        <td className="px-4 py-3 font-mono font-medium">{tx.transaction_id}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {tx.customer_id}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums">
                          ₹{tx.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          {tx.country} · {tx.merchant_category}
                        </td>
                        <td className="px-4 py-3">
                          {an ? (
                            <RiskBadge level={an.risk_level as Level} score={an.risk_score} />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded px-2 py-0.5 text-[11px] font-medium uppercase",
                              tx.status === "escalated"
                                ? "bg-red-500/10 text-red-700 dark:text-red-400"
                                : tx.status === "pending_review"
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                  : tx.status === "reviewed"
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : "bg-muted text-muted-foreground",
                            )}
                          >
                            {tx.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTx(tx);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No transactions match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Active Pipeline Result (from current session run if present) */}
      <h2 className="mb-3 text-sm font-semibold">Latest active session run</h2>
      {!result ? (
        <Card>
          <EmptyState
            icon={<FlaskConical className="h-5 w-5" />}
            title="No session analysis in progress"
            desc="Run a live transaction in the Analyze workspace or select one from the Investigation Queue above."
            action={
              <Link to="/analyze" className="text-sm font-medium text-primary hover:underline">
                Go to Analyze Workspace →
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="flex items-center gap-4 p-5">
            <ScoreRing score={result.rules.score} level={result.rules.level} size={84} />
            <div>
              <p className="text-xs text-muted-foreground">
                Risk score · {result.transaction.transaction_id}
              </p>
              <RiskBadge level={result.rules.level} score={result.rules.score} className="mt-1" />
            </div>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              Reason codes
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {result.report.reason_codes.length}
            </p>
            <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
              {result.report.reason_codes.join(", ") || "None"}
            </p>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <History className="h-3.5 w-3.5" />
              Closest synthetic case
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {result.similar[0] ? `${Math.round(result.similar[0].similarity * 100)}%` : "—"}
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {result.similar[0]?.case_id}
            </p>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Security status
            </p>
            <p className="mt-2 text-lg font-semibold">
              {result.injection.findings.length ? "Warning" : "Protected"}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {result.injection.findings.length} pattern(s) detected
            </p>
          </Card>
          <div className="md:col-span-2">
            <SecuritySummary r={result} />
          </div>
          <Card className="md:col-span-2">
            <CardHead
              title="Pipeline run"
              right={
                <Link to="/analyze" className="text-xs font-medium text-primary hover:underline">
                  Open full analysis →
                </Link>
              }
            />
            <div className="p-4">
              <StageList r={result} />
            </div>
          </Card>
        </div>
      )}

      {/* Investigation Details Modal */}
      {selectedTx && (
        <InvestigationModal
          item={selectedTx}
          onClose={() => setSelectedTx(null)}
          onStatusChange={(status) => {
            statusMutation.mutate({ id: selectedTx.id, status });
          }}
        />
      )}
    </>
  );
}
