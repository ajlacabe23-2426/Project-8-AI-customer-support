Task ID: P8-P6-CONSOLIDATED-FOUNDATION-2026-11-16
Title: Reconcile LeadFlow deterministic parity and additive case schema
Status: VERIFYING
Risk Tier: TIER_3
Base SHA: 821693e3e6f8132eb8950935a91a13fb9e793cc2

## Objective
Owner-authorized integration of PRs #52, #53 and #54 in the canonical Project 8 runtime, preserving source fixtures, existing widget/auth behavior and tenant isolation. Retain original PRs as evidence until the combined candidate is verified.

## Acceptance criteria
- Preserve existing Project 8 visitor classification, authentication, APIs and data boundaries.
- Preserve Project 6 deterministic scoring, lifecycle and opt-out behavior with source-equivalent fixtures; no unreviewed visitor qualification or implied communication consent.
- Preserve additive lead_cases and lead_case_events with workspace-matching FKs, owner read-only policies, anonymous denial, service-only actions, invariant transitions, versioning, consent constraints, event deduplication and cascade tests.
- Verify combined exact SHA with all required CI, security, agent-contract, Windows and disposable Supabase/browser integration tests.
- Compare actual Python and TypeScript source fixtures independently before full parity acceptance. The server-side case creation and transactional adapter are separate follow-up work, not implemented here.
- Preserve original draft architecture and release gate documentation; no hosted or commercial readiness claim.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `lib/leadflow-core.ts`
- `lib/leadflow-bridge.ts`
- `docs/ADR-001-LEADFLOW-CONSOLIDATION.md`
- `supabase/migrations/20261110112500_lead_case_workflow.sql`
- `docs/LEADFLOW_PERSISTENCE_ACCEPTANCE.md`
- `docs/FLAGSHIP_CONSOLIDATION_EXECUTION.md`

## Authorized test paths
- `lib/leadflow-core.test.ts`
- `lib/leadflow-bridge.test.ts`
- `tests/integration/project8.integration.mjs`

## Explicit non-goals
No hosted migration, production rollout, real customer data, credentials, new provider actions, automatic messages, billing, API/UI changes, relaxation of RLS or authorization, or claim of full commercial readiness.

## Required gates
Exact-head agent task contract, npm check/build, repository security monitor, Windows audit, disposable full migration reset, two-owner and anonymous RLS negative tests, immutable record and idempotency tests, and real-browser no-regression acceptance. Independent security and fixture review before hosted changes.
