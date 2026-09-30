import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, BookOpen, Database, Lock } from "lucide-react";
import { Card, CardHead, PageHeader } from "@/components/fl/ui";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — FraudLens" },
      {
        name: "description",
        content:
          "About FraudLens, its technology stack, security approach, synthetic data and limitations.",
      },
      { property: "og:title", content: "Documentation — FraudLens" },
      {
        property: "og:description",
        content: "Project overview, technology stack and limitations.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocsPage,
});

const STACK = [
  ["Python", "Core language of the reference implementation"],
  ["LangChain", "LLM orchestration framework"],
  ["LCEL", "Composable chain expression language"],
  ["Gemini", "Narrative generation (reference design)"],
  ["FAISS", "Vector similarity index"],
  ["Sentence Transformers", "Case embeddings"],
  ["Pydantic", "Input and report schema validation"],
  ["PyYAML", "Structured report serialisation"],
  ["Gradio", "Reference dashboard UI"],
];

function DocsPage() {
  return (
    <>
      <PageHeader
        crumb="Documentation"
        title="Documentation"
        desc="FraudLens: Real-Time Transaction Risk Narrator & Case-Retrieval Agent."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHead title="About FraudLens" icon={<BookOpen className="h-4 w-4" />} />
          <div className="space-y-3 p-5 text-sm leading-relaxed">
            <p>
              FraudLens examines a transaction and produces an evidence-grounded risk explanation.
              Instead of simply saying “this is fraudulent”, it explains why a transaction was
              flagged, which evidence supports that, which synthetic historical cases are similar,
              and which review action could be considered.
            </p>
            <p>
              Deterministic rules decide the score. Retrieval supplies historical context. A
              language model only narrates — its output is schema-validated, retried once if
              invalid, and replaced by a deterministic fallback if it still fails.
            </p>
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              This web build runs the pipeline in TypeScript on the server. Case similarity uses
              cosine similarity over transaction feature vectors (in place of FAISS embeddings), and
              narratives are generated through Lovable AI (in place of Gemini). Badges throughout
              the app state which path produced each result.
            </p>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHead title="Technology Stack" />
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {STACK.map(([n, d]) => (
              <div
                key={n}
                className="rounded-lg border border-border p-3 transition hover:border-primary/30"
              >
                <p className="text-sm font-semibold">{n}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHead title="Security" icon={<Lock className="h-4 w-4" />} />
          <p className="p-5 text-sm text-muted-foreground">
            Prompt-injection defense inspects every free-text field. Untrusted content is wrapped as
            data, redacted when instruction-like, and never able to alter the deterministic score.
            Accusatory or decision-like language in generated narratives fails validation.
          </p>
        </Card>
        <Card>
          <CardHead title="Data" icon={<Database className="h-4 w-4" />} />
          <p className="p-5 text-sm text-muted-foreground">
            Synthetic data only. All transactions, customers, KYC records and historical cases are
            fabricated for demonstration. No real customer information is used or stored.
          </p>
        </Card>
        <Card className="lg:col-span-2">
          <CardHead title="Limitations" icon={<AlertTriangle className="h-4 w-4" />} />
          <ul className="list-inside list-disc space-y-1 p-5 text-sm text-muted-foreground">
            <li>Academic prototype — not a production fraud detection system.</li>
            <li>No automatic transaction blocking, approval, or customer action.</li>
            <li>No real customer information.</li>
            <li>Rule thresholds and weights are illustrative, not calibrated on real data.</li>
            <li>LLM-as-a-Judge scores are heuristic indicators, not ground truth.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
