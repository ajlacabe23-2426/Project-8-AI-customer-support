# ADR-001 — Consolidate Project 6 LeadFlow into Project 8

Status: PROPOSED — compatibility slice implemented; no hosted mutations
Date: 2026-11-10
Canonical repository: Project-8-AI-customer-support
Historical source: project6-leadflow-v1

## Decision

Keep the Next.js + Supabase Project 8 workspace and owner authentication boundary as the product shell. Migrate Project 6 lead workflow into versioned TypeScript domain modules and tenant-scoped PostgreSQL transactions. Retain the old Python service as a read-only reference until independent behavioral parity and migration acceptance are complete. Do not operate both as production sources of truth.

Initial code slice is NOT wired to anonymous chat, writes, outbound providers, database migrations, or deployment:
- lib/leadflow-core.ts ports deterministic Project 6 qualification and lifecycle rules.
- lib/leadflow-core.test.ts pins source fixtures and transition behavior.
- lib/leadflow-bridge.ts and its tests define the pure Project 8 inquiry → Project 6 reviewed-intake seam. Visitor intent and communication contact are never treated as independently verified qualification or consent.
- Existing Project 8 lib/leads.ts continues to classify limited visitor intent and voluntary contact. Its 0–100 intent score is NOT Project 6's opportunity qualification score.

## Compatibility mismatches

| Boundary | Project 8 today | Project 6 today | Required decision |
|---|---|---|---|
| Lead identity | UUID, unique per conversation | Integer ID, independently submitted lead | Keep UUID, explicit workspace+source+dedupe identity; do not assume one lead per conversation indefinitely |
| Lifecycle | new/qualified/contacted/won/lost | received, awaiting-information, ready-for-review, qualified, nurture, awaiting-owner-action, ready-to-schedule, scheduled, closed, suppressed | Separate internal workflow state from customer-facing lead status; migrate existing records deterministically |
| Lead score | 0–100 message-based intent clues | 0–100 qualification based on value, timing, completeness, budget and decision-maker | Keep both labeled separately; never substitute guessed qualification fields |
| Consent | Contact voluntarily supplied in chat | Separate communication_consent and opted_out | Separate contact collection from permission to contact; no send without confirmed channel-specific consent |
| Storage | Tenant-scoped Supabase with RLS | Local SQLite | Rehearse additive migrations in disposable database with cross-tenant negative tests |
| External effects | No outbound CRM, email or SMS execution | Local outbox worker and sandbox adapter | Port durable outbox after lifecycle correctness; fail closed on uncertain provider result |
| Security | Owner session and visitor token | Optional demo operator token | Owner session and server-derived workspace authorization are authoritative; never accept untrusted tenant IDs as grants |

## Planned migration steps and gates

1. Reconcile PR backlog against current main; preserve historical branch references, and review auth, anonymous-body limits, lint and dependencies before closing.
2. Expand domain parity with more scoring, transition, invalid-input, consent and outbox fixtures. Run independent Python-vs-TypeScript golden-output differential tests before replacing a working path.
3. Schema proposal (not implemented here): add qualification breakdown, nullable intake fields, workflow state, consent evidence, tenant-scoped event/idempotency keys and durable outbox to a separate disposable database. Do not backfill invented facts.
4. Build a server-only idempotent conversation-to-lead adapter. Anonymous intent produces an unqualified intake, never automatically a qualified commercial lead. Reject cross-workspace writes, repeated event IDs and contradictory consent.
5. Add operator UI for unanswered questions, assignment, state transitions, actions and auditable event history.
6. Integrate sandbox providers first, including rate controls, retry/dead-letter observability, send-time consent, cancellation and ambiguous-send quarantine.
7. Run disposable Project 8 database/Chromium suites, real-browser onboarding, two-owner negative tests, recovery rehearsal and exact-SHA acceptance before a restricted pilot.
8. Archive Project 6 with cross-link only after migration parity and acceptance. Preserve repository and history.

## Stop conditions

- Never combine data or credentials with Axiovela.
- No hosted migrations, customer records, outbound messages, production deployment or billing authorized by this ADR.
- No conversion of visitor intent score into a qualified commercial score.
- No permissive privileged-function shortcuts, RLS bypass, silent retroactive consent or unbounded retry.
- Project 8 Supabase is reported INACTIVE. Independently verify before staging.

## Required proof for next PR

- npm run check on exact PR head.
- Frozen scoring and lifecycle fixtures independently verified against Project 6 Python tests.
- Score boundaries, invalid transitions and consent denial covered.
- Disposable DB migrations and tenant-isolation evidence before persistence changes.
- Maintainer review; green CI alone is not production acceptance.
