Task ID: P8-P6-LEAD-CASE-SCHEMA-2026-11-10
Title: Additive LeadFlow case persistence and tenant-isolation acceptance
Status: IMPLEMENTING
Risk Tier: TIER_3
Base SHA: 821693e3e6f8132eb8950935a91a13fb9e793cc2

## Objective
Create the isolated schema for Project 6's reviewed lead workflow inside Project 8 without changing existing visitor classification or applying hosted changes. Verify referential integrity, read-only owner RLS, consent proof constraints, lifecycle constraints, event idempotency and cascade on a disposable Supabase instance.

## Acceptance criteria
- Existing public.leads rows and visitor flows are preserved.
- Tenant-anchored lead_cases and lead_case_events cannot refer to different workspace ownership.
- Authenticated owners can view only their own cases and events, never modify internal workflow records.
- Anonymous clients cannot read or write internal case records.
- Service-only event keys are unique per workspace and cannot be silently replayed.
- Case transitions reject invalid edges and immutable lead/workspace identifiers cannot be rewritten.
- Explicit communication consent requires source and observed timestamp; opting out and consent are mutually exclusive.
- Existing conversation deletion cascades to case/events in disposable tests.
- Exact-head CI, migration reset, browser integration and security verification run before merge.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `supabase/migrations/20261110112500_lead_case_workflow.sql`
- `docs/LEADFLOW_PERSISTENCE_ACCEPTANCE.md`

## Authorized test paths
- `tests/integration/project8.integration.mjs`

## Explicit non-goals
No hosted migrations, hosted keys, customer data, schema destruction, renaming public.leads status, modifying public chat or admin API routes, new provider integrations, send/booking actions, AI inference, billing or production release. Do not remove a required security gate.

## Required gates
Project 8 task contract, npm check/build, repository security scan, disposable Supabase full migration reset, two-owner and anonymous RLS negative tests, immutable record and idempotency tests, and real-browser no-regression acceptance on the same commit. Tier 3 changes require separate security review and explicit approval before any hosted operation.
