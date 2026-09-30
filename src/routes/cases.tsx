import { createFileRoute } from "@tanstack/react-router";
import {
  queryOptions,
  useSuspenseQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Database, Plus, Search, Trash2, X, Shield, CheckCircle2 } from "lucide-react";
import {
  getCases,
  createCaseAction,
  deleteCaseAction,
  getSystemStatus,
} from "@/lib/fraudlens/analyze.functions";
import {
  Card,
  CardHead,
  EmptyState,
  PageHeader,
  RiskBadge,
  SyntheticTag,
  type Level,
} from "@/components/fl/ui";
import { cn } from "@/lib/utils";

const casesQuery = queryOptions({ queryKey: ["cases"], queryFn: () => getCases() });

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [
      { title: "Synthetic Case Repository — FraudLens" },
      {
        name: "description",
        content:
          "Browse the synthetic historical fraud-case dataset used for FraudLens similar-case retrieval.",
      },
      { property: "og:title", content: "Synthetic Case Repository — FraudLens" },
      {
        property: "og:description",
        content: "Synthetic historical cases for academic demonstration.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(casesQuery),
  component: CasesPage,
});

const sel =
  "rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function NewCaseModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (c: {
    case_id?: string;
    amount: number;
    category: string;
    country: string;
    device_new: boolean;
    international: boolean;
    risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description: string;
  }) => void;
}) {
  const [amount, setAmount] = useState("45000");
  const [category, setCategory] = useState("Electronics");
  const [country, setCountry] = useState("IN");
  const [deviceNew, setDeviceNew] = useState(true);
  const [intl, setIntl] = useState(false);
  const [risk, setRisk] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [desc, setDesc] = useState("High-value domestic purchase from a newly observed device.");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: parseFloat(amount) || 0,
      category,
      country,
      device_new: deviceNew,
      international: intl,
      risk_level: risk,
      description: desc,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Add Synthetic Case to Database</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Amount (INR)
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(sel, "w-full")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Risk Classification
              </label>
              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")}
                className={cn(sel, "w-full")}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Category
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={cn(sel, "w-full")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Country Code
              </label>
              <input
                type="text"
                required
                maxLength={2}
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                className={cn(sel, "w-full font-mono uppercase")}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={deviceNew}
                onChange={(e) => setDeviceNew(e.target.checked)}
                className="rounded border-border"
              />
              New Device Flag
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={intl}
                onChange={(e) => setIntl(e.target.checked)}
                className="rounded border-border"
              />
              International Flag
            </label>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Case Description
            </label>
            <textarea
              required
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className={cn(sel, "w-full resize-none leading-relaxed")}
              placeholder="Detailed evidence summary for semantic retrieval…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Save & Index Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CasesPage() {
  const { data } = useSuspenseQuery(casesQuery);
  const qc = useQueryClient();

  const fetchStatus = useServerFn(getSystemStatus);
  const statusQ = useQuery({ queryKey: ["status"], queryFn: () => fetchStatus() });
  const isAdmin = statusQ.data?.activeUserRole === "admin";

  const createCaseFn = useServerFn(createCaseAction);
  const deleteCaseFn = useServerFn(deleteCaseAction);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [q, setQ] = useState("");
  const [risk, setRisk] = useState("all");
  const [cat, setCat] = useState("all");
  const [geo, setGeo] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createCaseFn,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cases"] });
      void qc.invalidateQueries({ queryKey: ["status"] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCaseFn({ data: { id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cases"] });
      void qc.invalidateQueries({ queryKey: ["status"] });
      if (selected) setSelected(null);
    },
  });

  const cats = [...new Set(data.map((c) => c.category))].sort();
  const rows = useMemo(
    () =>
      data.filter(
        (c) =>
          (risk === "all" || c.risk_level === risk) &&
          (cat === "all" || c.category === cat) &&
          (geo === "all" || (geo === "intl" ? c.international : !c.international)) &&
          (!q ||
            `${c.case_id} ${c.description} ${c.category} ${c.country}`
              .toLowerCase()
              .includes(q.toLowerCase())),
      ),
    [data, q, risk, cat, geo],
  );

  const cur = data.find((c) => c.case_id === selected);

  return (
    <>
      <PageHeader
        crumb="Cases"
        title="Synthetic Case Repository"
        desc="The historical fraud-case dataset FraudLens indexes for vector and cosine retrieval."
        right={
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Case
              </button>
            )}
            <SyntheticTag label={`${data.length} Synthetic Cases Indexed`} />
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label="Search cases"
            placeholder="Search case ID, description, category…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={cn(sel, "w-full pl-9")}
          />
        </div>
        <select
          aria-label="Risk level"
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          className={sel}
        >
          <option value="all">All risk levels</option>
          {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <select
          aria-label="Merchant category"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className={sel}
        >
          <option value="all">All categories</option>
          {cats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Geography"
          value={geo}
          onChange={(e) => setGeo(e.target.value)}
          className={sel}
        >
          <option value="all">International & local</option>
          <option value="intl">International only</option>
          <option value="local">Domestic only</option>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Case ID</th>
                  <th className="px-4 font-medium">Risk Level</th>
                  <th className="px-4 text-right font-medium">Amount</th>
                  <th className="px-4 font-medium">Signals</th>
                  <th className="px-4 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.case_id}
                    tabIndex={0}
                    onClick={() => setSelected(c.case_id)}
                    onKeyDown={(e) => e.key === "Enter" && setSelected(c.case_id)}
                    aria-selected={selected === c.case_id}
                    className={cn(
                      "cursor-pointer border-b border-border last:border-0 hover:bg-muted/50 focus-visible:bg-accent focus-visible:outline-none",
                      selected === c.case_id && "bg-accent",
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs">{c.case_id}</td>
                    <td className="px-4">
                      <RiskBadge level={c.risk_level as Level} />
                    </td>
                    <td className="px-4 text-right font-mono text-xs tabular-nums">
                      ₹{c.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 text-xs text-muted-foreground">
                      {c.signals.join(", ") || "—"}
                    </td>
                    <td className="px-4 text-xs text-muted-foreground truncate max-w-xs">
                      {c.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detail inspection drawer */}
        <div className="space-y-4">
          <Card>
            <CardHead
              title="Case Details"
              right={
                cur && (
                  <span className="font-mono text-xs text-muted-foreground">{cur.case_id}</span>
                )
              }
            />
            {cur ? (
              <div className="space-y-4 p-5 text-sm">
                <div className="flex items-center justify-between">
                  <RiskBadge level={cur.risk_level as Level} />
                  <span className="font-mono text-base font-semibold">
                    ₹{cur.amount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs">
                  <p className="font-medium text-foreground">{cur.description}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-border py-1.5">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{cur.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-border py-1.5">
                    <span className="text-muted-foreground">Jurisdiction:</span>
                    <span className="font-medium">
                      {cur.country} ({cur.international ? "International" : "Domestic"})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border py-1.5">
                    <span className="text-muted-foreground">Device:</span>
                    <span className="font-medium">
                      {cur.device_new ? "Unseen / New" : "Known / Registered"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Signals Triggered:</span>
                    <span className="font-medium text-primary">
                      {cur.signals.join(", ") || "None"}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-2 border-t border-border">
                    <button
                      onClick={() => deleteMutation.mutate(cur.case_id)}
                      className="inline-flex items-center gap-1.5 rounded text-xs text-destructive hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Case from Database
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Database className="h-5 w-5" />}
                title="Select a Case"
                desc="Click any row in the repository table to inspect its vector properties, risk level, and metadata."
              />
            )}
          </Card>

          <Card className="p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Vector Search Integration</p>
            <p>
              Cases are embedded and compared using multi-feature cosine distance. Administrators
              can add new synthetic fraud vectors directly into the active database.
            </p>
          </Card>
        </div>
      </div>

      {isModalOpen && (
        <NewCaseModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={(caseData) => createMutation.mutate({ data: caseData })}
        />
      )}
    </>
  );
}
