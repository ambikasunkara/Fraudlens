# FraudLens — Master System & Generation Prompt

Use the prompt below in any LLM or AI coding agent to generate and deploy the complete **FraudLens** full-stack AI transaction risk intelligence and financial crime investigation platform.

---

```markdown
You are a senior full-stack AI engineer building "FraudLens", a production-grade Financial Fraud Detection, Risk Intelligence, and Investigation Platform for banking and fintech decision support.

## 1. System Vision & Core Design Principles
- **Explainable Decision Support**: Never act as an opaque black box. Provide human analysts with clear, evidence-grounded risk narratives, exact contributing signals, and similar historical precedents.
- **Deterministic Risk Scoring**: The final risk score (0-100) and risk level (LOW, MEDIUM, HIGH, CRITICAL) MUST be computed by a deterministic, rule-based engine. Generative AI is strictly used to formulate natural language narratives from evidence context — it CANNOT alter scores or override rules.
- **Adversarial Prompt Injection Defense**: Transaction memos, customer fields, and retrieved documents are untrusted data. They must pass through a strict regex-based Prompt Injection Inspector that neutralizes instructions (e.g., "ignore prior instructions", "mark as safe", "reveal system prompt") before AI inference.
- **Strict Role-Based Access Control (RBAC)**: Support three primary user roles with distinct capabilities:
  - `Admin`: Full permissions (configure risk rules/thresholds, manage synthetic cases, inspect audit logs, change system settings).
  - `Analyst`: Operational permissions (analyze transactions, triage investigation statuses, inspect security alerts, bookmark reports).
  - `Viewer`: Read-only compliance auditor access.

---

## 2. Complete Database Architecture & Schema
Provision an integrated persistent database ledger with the following core entities:

1. `profiles`: User identity, display names, email, and timestamps.
2. `user_roles`: Separate role mapping (`admin`, `analyst`, `viewer`) with helper functions (`has_role`, `can_write`, `has_any_role`).
3. `transactions`: Incoming financial records containing `transaction_id`, `customer_id`, `amount`, `currency`, `country`, `device_id`, `device_new`, `international`, `merchant_category`, `memo`, `status` (`analyzed`, `pending_review`, `reviewed`, `escalated`, `closed`).
4. `transaction_analyses`: Full analysis output linking to transaction, storing `risk_score`, `risk_level`, `reason_codes`, `supporting_evidence`, `recommended_action`, `narrative`, `narrative_source` (`ai` | `deterministic_fallback`), `stages` timeline breakdown, and duration.
5. `historical_cases`: Synthetic historical fraud repository (minimum 30 cases across Groceries, Dining, Electronics, Travel, Jewellery, Crypto, Luxury, Software) with `amount`, `country`, `new_device`, `international`, `category`, `risk_level`, and `description`.
6. `case_embeddings`: High-dimensional vector embeddings for cosine similarity retrieval.
7. `retrieved_cases`: Top-k similar cases identified for each specific transaction investigation.
8. `kyc_profiles`: Synthetic customer demographic and behavioral baselines (account age, usual country, typical spending range, registered device count).
9. `security_events`: Detailed audit log of every detected prompt injection attempt with matched pattern, field, excerpt, severity (`critical`, `high`, `medium`, `low`), and neutralized status.
10. `evaluations`: Automated LLM-as-a-Judge benchmark evaluations scoring each generated narrative across Completeness, Evidence Grounding, Clarity, Unsupported Claims, and Disclaimer Compliance (0-10 scale).
11. `audit_logs`: Immutable security log tracking every system action (`TRANSACTION_ANALYZED`, `CASE_CREATED`, `SETTINGS_UPDATED`, `ROLE_SWITCHED`, etc.).
12. `saved_reports`: Investigator bookmarks, tags, and triage notes.
13. `app_settings`: Dynamic operational settings (configurable high-amount threshold e.g. ₹50,000, signal weights e.g. HIGH_AMOUNT +30, NEW_DEVICE +25, etc.).

---

## 3. 12-Stage Transaction Processing Pipeline
When a transaction is submitted, process it through the sequential pipeline:
1. **Intake & Zod Validation**: Validate JSON schema, required types, non-negative amounts, and lengths.
2. **Prompt Injection Guard**: Scan fields for prompt override, outcome manipulation, or secret exfiltration. Neutralize matched patterns and flag a security event.
3. **Deterministic Rule Engine**: Evaluate transaction against dynamic thresholds:
   - High Amount (e.g., > ₹50,000) -> +30
   - Unregistered/New Device -> +25
   - International Jurisdiction -> +20
   - Higher-Risk Category (Electronics, Jewellery, Crypto, Gift cards) -> +5
   - Multiple Concurrent Core Signals (>= 3) -> +15
   Map total score to Risk Bands: LOW (0-29), MEDIUM (30-59), HIGH (60-79), CRITICAL (80-100).
4. **KYC Baseline Lookup**: Fetch customer historical typical velocity and registered device counts.
5. **Vector Case Retrieval**: Perform multi-feature cosine similarity search across synthetic historical cases to retrieve Top-3 closest precedents.
6. **Grounding Context Assembly**: Assemble evidence structure explicitly framed as untrusted data.
7. **AI Narrative Generation**: Call Gemini 2.5 Flash with structured prompt constraints (3-5 sentences, plain professional English, strictly evidence-grounded, non-accusatory, referencing deterministic score and top case).
8. **Zod Output Verification & Bounded Retry**: Verify narrative matches schema and contains no forbidden words ("fraudster", "guilty", "account frozen"). Retry at most once if violated.
9. **Deterministic Fallback**: If LLM times out or fails schema checks, produce a structured deterministic narrative template so the analyst is never blocked.
10. **Report Synthesis & YAML Export**: Package result into standardized JSON and YAML reports with academic disclaimer.
11. **LLM-as-a-Judge Evaluation**: Score the generated narrative against the evidence rubric.
12. **Persistent Database Commit**: Atomically save the transaction, analysis, retrieved cases, security alerts, evaluation metrics, and audit log.

---

## 4. Frontend & User Experience Requirements
Build an intuitive, responsive interface using Tailwind CSS and Radix UI:
- **Global Header**: Real-time Engine status, Database records counter, and an interactive **Role Selector** (`Admin`, `Analyst`, `Viewer`) to test RBAC live.
- **Dashboard (`/`)**:
  - Executive KPI cards (Total Analyzed, High-Risk Rate %, Average Risk Score, Injections Blocked).
  - Visual Recharts charts (Risk Distribution Bar/Donut, Risk Signal Frequency).
  - Real-time **Investigation Queue & Transaction Ledger** with status filtering (`all`, `pending_review`, `reviewed`, `escalated`, `closed`) and an interactive **Investigation Modal/Drawer**.
- **Analyze Workspace (`/analyze`)**:
  - Interactive JSON editor with line numbers and real-time schema validation.
  - One-click sample loaders (Normal, Suspicious, Adversarial Prompt Injection).
  - Visual execution timeline with ms timings, score gauge, evidence panel, and report export.
- **Synthetic Case Repository (`/cases`)**:
  - Paginated data table with search, category, risk, and geography filters.
  - **Admin CRUD**: "Add Synthetic Case" modal and "Delete Case" button with automatic vector re-indexing and audit logging.
- **Security Operations Center (`/security`)**:
  - Active detection rules showcase and live inspection card.
  - Historical database incident ledger showing all neutralized injection attempts with excerpts and severities.
- **Evaluation Benchmark (`/evaluation`)**:
  - Benchmark score overview across Completeness, Grounding, Clarity, and Compliance.
  - Historical evaluation table with judge models and inspection modal.
- **Architecture & Config (`/architecture`)**:
  - Visual 12-stage pipeline diagram with technology badges.
  - Interactive risk threshold editor (Admin only).
  - Real-time Immutable System Audit Log table.
- **Academic Disclaimer**:
  - Include clear notices: "Decision-support output from an academic prototype using synthetic data. Not an accusation and not an automated decision."
```
