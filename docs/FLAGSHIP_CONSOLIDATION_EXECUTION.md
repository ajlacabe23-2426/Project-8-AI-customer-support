# Flagship Consolidation Execution Plan — Project 6 + Project 8

**Status:** Design and acceptance plan only. NOT merged, NOT deployed, NOT approved for customer data.

**Product:** LeadFlow CX (working title), a tenant-safe customer-support and lead-operations application. **Canonical runtime:** Project 8 Next.js + Supabase. Project 6 Python/SQLite is the reference contract and fixtures, not a second live service.

## Source-of-truth decisions

| Responsibility | Owner |
| --- | --- |
| Workspace identity, sign-in, sessions, owner inbox, visitor widget, Supabase RLS | Project 8 |
| Explainable lead qualification, priority rules, opt-out behavior, lifecycle transitions | Port and test from Project 6 |
| Lead-case persistence and event journal | Additive tenant-scoped Supabase schema reviewed in Project 8 |
| Messaging, scheduling and CRM | Not enabled until provider, idempotency, consent, abuse and failure tests pass |
| Shared customer-facing UI | One Project 8 workspace; no second unrelated operator portal |
| AI | Grounded drafts and knowledge retrieval only; cannot grant permission, change authority, infer consent, or make irreversible external actions |

## Existing integration candidates (do not duplicate)

- [PR #52](https://github.com/ajlacabe23-2426/Project-8-AI-customer-support/pull/52): deterministic pure TypeScript parity and typed lead-intent bridge. Draft; requires exact-head tests and independent source-fixture comparison.
- [PR #53](https://github.com/ajlacabe23-2426/Project-8-AI-customer-support/pull/53): additive lead-case/event migration and local tenant-negative tests. Draft; verify dependency and migration ordering before integration.
- Do **not** cherry-pick or merge both independently into main if shared migrations or app seams are incompatible.

## Phase 1 — Branch reconciliation

1. Freeze Project 6 source scoring fixtures at a recorded source commit SHA; compare inputs and outputs against TypeScript scoring in PR #52.
2. Verify PR #52 at its current head with lint, typecheck, unit tests, build and negative consent tests. Confirm no unexpected API or widget changes.
3. Rebase or carefully merge the PR #53 branch on the reviewed #52 integration head; review the combined diff before CI. No automatic prod database application.
4. Run every disposable Supabase migration from a blank state and from one previous migration checkpoint. Test **two distinct owners and two unrelated workspaces** under both REST and direct RLS.
5. Implement a server-only, authenticated case-creation adapter with organization context derived from the authenticated session, not user-supplied request fields.
6. Ensure atomic case transition + event insertion + optimistic version check + deduplication within a single transaction/RPC.
7. Create a PR with a complete acceptance packet; do not enable outbound integrations.

## Canonical event flow

```
Public website widget -> anonymous session / rate limiting -> grounded support
  -> explicit handoff / lead intent -> PII-minimized review candidate
  -> authenticated workspace owner -> deterministic qualification
  -> tenant-scoped case / event journal -> human disposition
  -> consent-checked provider outbox (disabled until approved)
```

### Case contract (design target, not an applied migration)

- `id` UUID; `workspace_id` UUID; `source_conversation_id` nullable UUID.
- `review_status`: needs_review, accepted, dismissed.
- `qualification_status`: needs_info, nurture, qualified.
- `score` integer 0..100, `score_version`, `scoring_evidence` bounded JSON.
- `lifecycle_status`: new, working, waiting, resolved, closed.
- `version` integer monotonically increasing for optimistic concurrency.
- `consent_proof_id` nullable; `opted_out` boolean; follow-up remains draft-only when consent is not established.
- `created_at`, `updated_at`, `source_dedupe_key` tenant-scoped.
- Separate append-only logical `lead_case_events` keyed to workspace and case with bounded PII-free metadata; exact retention and deletion subject to privacy review.

**Enforce:** workspace-consistent foreign keys, restrictive RLS, per-tenant unique dedupe keys, check constraints on score and status, server-derived workspace, and immutable provenance in event records.

## Required acceptance matrix

| Gate | Passing evidence |
| --- | --- |
| G1 build integrity | Exact commit SHA CI green: lint, TypeScript, tests, production build, dependency audit |
| G2 parity | Golden fixtures compare Python V1 reference and TypeScript core, including boundaries and invalid states |
| G3 tenant isolation | Anonymous and workspace-B cannot read/write/delete workspace-A cases, events, PII or outbox; tests fail closed |
| G4 consent | No follow-up side effect without separately recorded and verified channel-specific permission; opted-out always suppressed |
| G5 retries | Duplicate and concurrent creation idempotent; expected-version conflict rejects; atomic event/case writes |
| G6 abuse | Rate limit, input bounds, replay, origin spoofing, prompt-injection and elevated-role negative cases |
| G7 resilience | Fresh backup and actual recovery drill; operational alerts, dead-letter, no phantom send after ambiguous provider result |
| G8 customer value | Explicit consenting pilot with pre-registered lead response-time / case-resolution metrics and recorded denominators |
| G9 commercial launch | Legal/retention review, deletion pathway, operator identity/RBAC, support ownership, billing, and incident runbook approved |

**Production GO = all gates pass.** Any single failure is NO-GO. Use OWASP ASVS 5.0 as an audit mapping framework, not a certification claim.

## Rollback and branch policy

- All PRs reviewed with no automatic merge/deploy.
- Migrations additive and reversible by forward repair/restore plan; do not assume destructive rollback is safe.
- Keep Project 6 untouched until hosted acceptance, migration evidence and historical fixture parity establish full replacement.
- No autonomous email/SMS, bookings, CRM writes, payment processing, or customer-facing AI promises before acceptance.
- Preserve a release artifact: deployed commit SHA, migration checksums, test report, screenshots, backup drill, environment name, owner signoff.

## Initial customer success instrumentation (pilot only)

- `time_to_first_human_response`: from first eligible contact to first real human response; report p50/p90 and coverage.
- `lead_review_coverage`: accepted or dismissed eligible candidates / all eligible candidates.
- `case_resolution_time`: opening to explicit resolved status; stratify by customer and severity.
- `consent_violations`: target zero; count suspected and confirmed incidents separately.
- `handoff_quality`: human-rated correctness over pre-sampled cases, including abstentions.

Never publish improvement or conversion percentages until a valid customer baseline and matched comparison period exist.

## Next executable pull request after this documentation

`integration/leadflow-parity-reconciliation`: combine PR #52 plus #53 in order, preserve current endpoints, implement no external side effects, and attach exact-head disposable test evidence. Merge requires separate review.
