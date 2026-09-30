# FraudLens: turn the existing site into a full-stack platform

Keep the current FraudLens project, its light FinTech design and its pages. Replace in-memory data with a real database, and add sign-in, roles, history, investigations, audit logging, analytics, settings and exports.

## Phase 1: Foundation

- Turn on Lovable Cloud (PostgreSQL, sign-in, storage) and enable pgvector.
- Store the Gemini key as a server-side secret named `GEMINI_API_KEY`. Remove the Lovable AI Gateway from the analysis workflow.
- Add `.env.example` with placeholders only.
- Migrations for: profiles, user_roles (separate table: admin / analyst / viewer), transactions, transaction_analyses, historical_cases, case_embeddings (vector), retrieved_cases, kyc_profiles, security_events, evaluations, audit_logs, saved_reports, app_settings (risk thresholds).
- Row-level security on every table, using a `has_role()` check. Viewers can only read. Analysts can create and analyze. Admins can manage cases, settings, users and audit logs.
- Seed data in a migration: 30 synthetic historical cases, 6 synthetic KYC profiles, 6 sample transactions (low, medium, high, critical, international, new device, prompt injection). Everything is labelled `synthetic`.

## Phase 2: Authentication

- Sign-in page with sign up, sign in, forgot password and reset password, in FraudLens branding.
- A profile and a viewer role are created automatically for each new user. The first user becomes admin.
- The app pages are protected behind sign-in. Navigation only shows the pages each role is allowed to use.

## Phase 3: Backend pipeline (split into modules)

`lib/fraudlens/`: engine.ts (rules, thresholds loaded from settings), security.ts (injection guard, also run on retrieved case text), embeddings.server.ts (provider interface), vectorstore.ts (VectorStore interface with a pgvector provider and a local in-memory cosine/FAISS-style provider), gemini.server.ts, prompts.ts, reports.ts, evaluation.ts, audit.server.ts, database.server.ts.

Pipeline steps:

1. Validate the input.
2. Run these in parallel: injection guard, rules, KYC lookup, and embedding + vector top-k.
3. Gemini 2.5 Flash writes the narrative. It uses few-shot, constraint, negative and evidence-grounded prompts, with untrusted-data framing. Output is structured JSON with a timeout.
4. Validate the output with Zod and retry at most once with a correction prompt. If it still fails, use the deterministic fallback.
5. Save the transaction, analysis, retrieved cases and security events.
6. The judge scores the narrative, and the evaluation is saved. If it fails, the evaluation is stored as unavailable.
7. Write an audit log and return the result. Every stage has a timestamp for the timeline.

## Phase 4: Pages

- **Dashboard / Analytics:** real counts and Recharts charts (risk distribution, trend, reason codes, AI vs fallback, security trend). Shows an empty state when there is no data.
- **Analyze:** six samples. Toasts for completion, failure and security events.
- **History:** search, filters, sort, date range.
- **Investigation (`/investigation/$id`):** every section plus the audit timeline and exports (YAML, JSON, print/PDF via the browser's print option). Save reports with notes.
- **Cases:** paging, filters, detail drawer. Admins can add and edit cases (they are re-embedded, and every change is audited).
- **Security Center:** real summary cards, event table and detail drawer.
- **Evaluation:** saved judge results with a disclaimer that they are heuristic.
- **Settings:** profile, security, AI config (shows "Gemini API key: Configured"), risk rules (admin edits are audited), data, application. Admins can manage user roles.
- **Status:** live checks for Engine, Database, Gemini and Vector Search.
- **Global search:** Cmd/Ctrl+K search across transactions, customers, cases, analyses and reason codes.
- **Architecture and Docs:** show the actual architecture, a data-model diagram and a "For Viva" section. The README explains pgvector vs FAISS as the prompt requires.

## Phase 5: Tests and verification

- Vitest for validation, rules, injection, the vector store (local provider), the fallback path, and the report schema. RLS is checked with SQL checks run as each role.
- Run the build, lint, tests and migrations. Then do a signed-in run of the suspicious sample and the injection sample, and report honestly whatever could not run.

## Technical notes and honest limits

- **Embeddings:** Sentence Transformers can't run on the hosting runtime, which has no Python or native binaries. The default is Gemini `gemini-embedding-001` (768 dimensions) behind the provider interface. The model name is stored with each vector. A Sentence-Transformers service boundary is documented as the swap-in option.
- **LangChain:** not used. The Viva section explains why direct calls were chosen.
- **PDF:** made through a print-friendly page and the browser's "Save as PDF", not a server PDF library.
- **Scope:** this is a very large build and will be delivered across several turns, phase by phase.
