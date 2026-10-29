Task ID: P8-OWNER-ONBOARDING-EVIDENCE-2026-10-29
Title: Add authenticated, evidence-backed owner onboarding checklist
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: e3bee37a8f290649a343c4d5136a075ec2757d90

## Objective
Give a signed-in business owner a trustworthy setup checklist computed from RLS-scoped workspace records, approved origins and knowledge articles. Preserve existing authorization and visitor boundaries. Never claim installed widget, hosted acceptance, billing entitlement or production readiness without evidence.

## Acceptance criteria
- Onboarding API requires an actual authenticated owner and reads only RLS-visible workspace and article count.
- Missing/foreign workspace does not expose any private records.
- Dashboard updates setup state when knowledge or origins change, and explicitly keeps widget test and production readiness unverified.
- Pure setup-state tests and unauthenticated HTTP integration check pass.
- Full CI, security, agent contract and disposable RLS/widget checks pass at exact head.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `app/api/admin/onboarding/route.ts`
- `app/dashboard/workspace.tsx`
- `docs/ONBOARDING_AND_SERVICE_GATES.md`
- `lib/onboarding.ts`

## Authorized test paths
- `lib/onboarding.test.ts`
- `tests/integration/project8.integration.mjs`

## Explicit non-goals
No schema migration, payment processor, paid entitlement enforcement, autonomous publishing, customer-data migration, service-role exposure, operator impersonation, public widget access expansion or hosted deployment. This is an authenticated beta setup visibility improvement only.

## Required gates
Exact-SHA full lint/typecheck/test/build, security monitor, Agent Team contract, disposable Supabase RLS/widget acceptance and owner-device hosted browser verification. No merge, public release or customer-data GO without separate review.
