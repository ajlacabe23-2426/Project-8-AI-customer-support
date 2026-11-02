Task ID: P8-AUTH-OPERATIONS-RECONCILIATION-2026-11-02
Title: Integrate tested email auth and owner onboarding / widget pause
Status: VERIFYING
Risk Tier: TIER_3
Base SHA: 4227d781f12693a08dbd1e3fe9eaa3291f861081

## Objective
Reconcile PR #48 owner-scoped setup, accurate usage telemetry and visitor widget emergency pause onto main after PR #50 email login and isolated development migration repair, preserving both features and their test boundaries.

## Acceptance criteria
- Preserve the merged PR #50 PKCE and email-token authentication, sign-in errors and extension-qualified SHA-256 migration, unchanged.
- Owner-scoped onboarding and exact usage APIs, honest dashboard status and optional fail-closed visitor pause.
- Preserve the newer auth message assertion and cross-owner onboarding and usage tests in the real-browser acceptance harness.
- Exact SHA checks including CI, security, agent contract, Windows audit, browser and disposable Supabase integration must pass before merge.
- No actual hosted tenant release or production claims.

## Authorized implementation paths
- .codex/CURRENT_TASK.md
- app/api/admin/onboarding/route.ts
- app/api/admin/usage/route.ts
- app/dashboard/workspace.tsx
- docs/ONBOARDING_AND_SERVICE_GATES.md
- docs/SERVICE_OPERATIONS.md
- lib/onboarding.ts
- lib/service-controls.ts
- lib/widget.ts

## Authorized test paths
- lib/onboarding.test.ts
- lib/service-controls.test.ts
- tests/integration/project8.integration.mjs
- tests/acceptance/magic-link.browser.cjs

## Explicit non-goals
No hosted migration, customer data, billing, provider messaging, production rollout, secrets, account impersonation, or weakening auth/RLS. Do not claim beta GO.

## Required gates
New exact-head CI, Security Monitor, agent-contract, Windows audit and disposable Supabase integration. Separately verify hosted two-owner browser acceptance before commercial rollout.
