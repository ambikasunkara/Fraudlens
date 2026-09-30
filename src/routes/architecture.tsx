import { createFileRoute } from "@tanstack/react-router";
import {
  queryOptions,
  useSuspenseQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowDown, Check, Database, Edit2, Lock, Save, Shield, Sliders } from "lucide-react";
import {
  getSystemStatus,
  getAuditLogsList,
  updateAppSettingsAction,
} from "@/lib/fraudlens/analyze.functions";
import { Card, CardHead, PageHeader, RiskScale } from "@/components/fl/ui";
import { cn } from "@/lib/utils";

const statusQuery = queryOptions({ queryKey: ["status"], queryFn: () => getSystemStatus() });

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "How It Works — FraudLens Full-Stack Architecture" },
      {
        name: "description",
        content:
          "The FraudLens pipeline: validation, injection guard, risk engine, KYC, retrieval, LLM narrative, schema validation, fallback and evaluation.",
      },
      { property: "og:title", content: "How It Works — FraudLens Full-Stack Architecture" },
      {
        property: "og:description",
        content:
          "Every stage of the FraudLens transaction risk pipeline and database architecture.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(statusQuery),
  component: ArchPage,
});

const STAGES = [
  [
    "1. Transaction Intake",
    "Synthetic transaction submitted as validated JSON payload.",
    "JSON Schema + Zod",
  ],
  [
    "2. Schema Validation",
    "Validates all mandatory fields, limits, and numeric boundaries.",
    "Zod strict validator",
  ],
  [
    "3. Prompt Injection Guard",
    "Flags and neutralizes instruction-like text embedded in untrusted memos or fields.",
    "Regex pattern scanner",
  ],
  [
    "4. Deterministic Risk Engine",
    "Scores the transaction with configurable deterministic rules and thresholds.",
    "Rule Engine (Database Config)",
  ],
  [
    "5. Synthetic KYC Lookup",
    "Retrieves synthetic customer profile, account age, typical limits, and baseline.",
    "Synthetic KYC profile store",
  ],
  [
    "6. Vector Case Retrieval",
    "Retrieves closest historical fraud cases using multi-feature cosine similarity.",
    "Exact Scan (30+ Vectors)",
  ],
  [
    "7. Evidence Context Assembly",
    "Assembles strictly grounded context tagged as untrusted data for LLM.",
    "Evidence grounding builder",
  ],
  [
    "8. LLM Risk Narrative",
    "Generates professional explainable narrative without changing deterministic score.",
    "Gemini 2.5 Flash / Astra",
  ],
  [
    "9. Output Zod Validation",
    "Validates output schema and verifies forbidden accusatory wording absence.",
    "Bounded 2-pass retry",
  ],
  [
    "10. Deterministic Fallback",
    "Graceful fallback narrative if LLM is unreachable or violates schema.",
    "Rule-based fallback template",
  ],
  [
    "11. LLM-as-a-Judge Evaluation",
    "Independent pass evaluating completeness, grounding, clarity, and safety.",
    "Rubric-grounded Evaluator",
  ],
  [
    "12. Persistent Database Ledger",
    "Persists transaction, analysis, security alerts, evaluations, and audit logs.",
    "PostgreSQL / In-Memory Engine",
  ],
];

function ArchPage() {
  const { data } = useSuspenseQuery(statusQuery);
  const qc = useQueryClient();

  const fetchAudit = useServerFn(getAuditLogsList);
  const auditQ = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => fetchAudit({ data: { limit: 50 } }),
    refetchInterval: 15000,
  });

  const updateSettingsFn = useServerFn(updateAppSettingsAction);
  const isAdmin = data.activeUserRole === "admin";

  const [thresholdInput, setThresholdInput] = useState(data.config.threshold.toString());
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);

  const settingsMutation = useMutation({
    mutationFn: (newThresh: number) =>
      updateSettingsFn({ data: { highAmountThreshold: newThresh } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["status"] });
      void qc.invalidateQueries({ queryKey: ["auditLogs"] });
      setIsEditingThreshold(false);
    },
  });

  const handleSaveThreshold = () => {
    const val = parseInt(thresholdInput, 10);
    if (!isNaN(val) && val > 0) {
      settingsMutation.mutate(val);
    }
  };

  return (
    <>
      <PageHeader
        crumb="Architecture"
        title="Full-Stack System Architecture & Pipeline"
        desc="End-to-end design of the FraudLens decision-support system: deterministic scoring, prompt defense, vector retrieval, and immutable audit logs."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Pipeline Stages */}
        <div>
          <h2 className="mb-3 text-sm font-semibold">12-Stage Transaction Processing Pipeline</h2>
          <ol className="space-y-0">
            {STAGES.map(([n, p, t], i) => (
              <li key={n}>
                <Card className="flex gap-4 p-4 transition-shadow hover:shadow-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{n}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p}</p>
                    <p className="mt-1 text-[11px] font-medium text-teal">{t}</p>
                  </div>
                </Card>
                {i < STAGES.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="h-4 w-4 text-muted-foreground/60" aria-hidden />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Sidebar: Engine Config & Database Status */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHead
              title="Live Engine Configuration"
              sub="Configured in database settings"
              right={
                isAdmin &&
                !isEditingThreshold && (
                  <button
                    onClick={() => setIsEditingThreshold(true)}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                )
              }
            />
            <div className="space-y-4 p-5 text-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-muted-foreground text-xs">High-amount threshold</span>
                {isEditingThreshold && isAdmin ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={thresholdInput}
                      onChange={(e) => setThresholdInput(e.target.value)}
                      className="w-24 rounded border border-input bg-card px-2 py-1 font-mono text-xs outline-none"
                    />
                    <button
                      onClick={handleSaveThreshold}
                      className="rounded bg-primary p-1 text-primary-foreground hover:bg-primary/90"
                    >
                      <Save className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="tabular-nums font-mono font-semibold text-foreground">
                    ₹{data.config.threshold.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Rule Weights</p>
                <ul className="space-y-1">
                  {Object.entries(data.config.weights).map(([k, v]) => (
                    <li key={k} className="flex justify-between font-mono text-xs">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold text-primary">+{v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-2 text-xs text-muted-foreground">Risk Score Bands</p>
                <RiskScale score={0} bands={data.config.bands} />
              </div>

              <div className="flex justify-between border-t border-border pt-3 text-xs">
                <span className="text-muted-foreground">Synthetic Cases Loaded</span>
                <span className="tabular-nums font-mono font-medium">{data.casesLoaded}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Database Storage</span>
                <span className="font-mono text-success font-medium">Online (Persistent)</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Active User Role</span>
                <span className="font-mono capitalize font-medium text-primary">
                  {data.activeUserRole}
                </span>
              </div>
            </div>
          </Card>

          {/* Database Schema Map Card */}
          <Card className="p-5 text-xs">
            <h3 className="font-semibold flex items-center gap-1.5 mb-2">
              <Database className="h-4 w-4 text-primary" />
              Database Entities & Schema
            </h3>
            <p className="text-muted-foreground mb-3 leading-relaxed">
              Fully aligned with Supabase PostgreSQL migrations (RLS enforced with{" "}
              <code>has_role()</code> checks).
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "profiles",
                "user_roles",
                "transactions",
                "transaction_analyses",
                "historical_cases",
                "case_embeddings",
                "retrieved_cases",
                "kyc_profiles",
                "security_events",
                "evaluations",
                "audit_logs",
                "saved_reports",
                "app_settings",
              ].map((table) => (
                <span
                  key={table}
                  className="rounded border border-border bg-muted/50 px-2 py-0.5 font-mono text-[11px]"
                >
                  {table}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Immutable Audit Logs Ledger */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Immutable System Audit Log
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time audit trails of every transaction analysis, case modification, role change,
              and settings update
            </p>
          </div>
          <span className="rounded bg-muted px-2.5 py-1 text-xs text-muted-foreground font-mono">
            {auditQ.data?.length ?? 0} Audit Entries
          </span>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Timestamp</th>
                  <th className="px-4 py-2.5 font-medium">Actor</th>
                  <th className="px-4 py-2.5 font-medium">Action</th>
                  <th className="px-4 py-2.5 font-medium">Entity Type</th>
                  <th className="px-4 py-2.5 font-medium">Entity ID</th>
                  <th className="px-4 py-2.5 font-medium">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {auditQ.isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      Loading audit logs…
                    </td>
                  </tr>
                ) : auditQ.data && auditQ.data.length > 0 ? (
                  auditQ.data.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-2.5 font-mono text-muted-foreground">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-mono font-medium">{log.userEmail}</span>
                        <span className="ml-1 text-[10px] text-muted-foreground uppercase">
                          ({log.role})
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono font-semibold text-primary">
                        {log.action}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{log.entityType}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{log.entityId}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground max-w-xs truncate">
                        {JSON.stringify(log.metadata)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No audit events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </>
  );
}
