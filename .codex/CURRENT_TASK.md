Task ID: P8-BETA-OPERATIONS-INTEGRATION-2026-10-29
Title: Reconcile evidence-backed owner onboarding with scoped service telemetry and emergency pause
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: e3bee37a8f290649a343c4d5136a075ec2757d90

## Objective
Develop a safe, traceable owner business-onboarding flow and accurate workspace-level read-only operational counts, while enabling a server-side emergency pause for anonymous widget requests. Keep user-data handling and release claims honest and preserve all RLS boundaries.

## Acceptance criteria
- Authenticated, owner RLS-scoped onboarding and usage APIs reject anonymous users and foreign workspace identifiers without leaking cross-workspace information.
- Usage counts are exact all-time record counts; no message content, customer PII or billing claims.
- Dashboard separates verified configuration from unverified widget installation and service production readiness.
- A server-side emergency flag blocks all visitor context lookups without impairing owner dashboards.
- React, TypeScript, lint, API/regression, agent-contract and disposable Supabase/widget tests must pass at exact PR head.
- No real payment, email, user impersonation or production deployment.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `app/api/admin/onboarding/route.ts`
- `app/api/admin/usage/route.ts`
- `app/dashboard/workspace.tsx`
- `docs/ONBOARDING_AND_SERVICE_GATES.md`
- `docs/SERVICE_OPERATIONS.md`
- `lib/onboarding.ts`
- `lib/service-controls.ts`
- `lib/widget.ts`

## Authorized test paths
- `lib/onboarding.test.ts`
- `lib/service-controls.test.ts`
- `tests/integration/project8.integration.mjs`
- `tests/acceptance/magic-link.browser.cjs`

## Explicit non-goals
No Supabase schema migrations, live database writes, customer-data import, billing/usage quotas, actual subscription lifecycle, provider email delivery, enabling live payment, public release, changes to current auth/session logic, or changes to agent privilege. Server-side paused widget mode is not a substitute for edge restrictions.

## Required gates
GitHub full checks, security monitor, Agent Team contract, disposable local database/widget test at integrated exact SHA, then independent hosted owner and two-tenant browser acceptance before any commercial/production claims. Preserve human release approval.
