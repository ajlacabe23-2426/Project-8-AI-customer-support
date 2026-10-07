Task ID: P8-ADMIN-AUDIT-CACHE-HARDENING-V1
Title: Prevent caching of sensitive owner-audit responses
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: 2d7fedef0b5b50b55ec0384c11ca7f0c8a264b0d

## Objective

Harden the private-beta owner audit endpoint so every response, including unauthenticated failures, is explicitly non-cacheable. Add behavioral regression coverage without changing authentication, tenant visibility, audit contents, or hosted infrastructure.

## Acceptance criteria

- Unauthenticated owner-audit requests return 401 with Cache-Control containing no-store.
- Existing invalid-workspace, denied-workspace, database-error and success responses remain no-store.
- No audit data, workspace data, or authentication state is exposed to unauthenticated callers.
- Existing owner/workspace RLS and audit-event boundaries remain unchanged.
- The disposable integration suite exercises the real Next.js endpoint and prevents the 401 caching regression from returning.
- Existing widget, lead-recovery, retention, tenant-isolation and dependency-security gates remain intact.

## Authorized implementation paths

- .codex/CURRENT_TASK.md
- app/api/admin/audit/route.ts
- tests/integration/project8.integration.mjs

## Authorized test paths

- tests/integration/project8.integration.mjs

## Explicit non-goals

- No hosted Supabase mutation.
- No production deployment or configuration change.
- No auth-provider, RLS, migration, audit-schema, billing, CRM, messaging, or model-provider changes.
- No customer data creation outside the disposable loopback integration environment.
- No cross-project infrastructure.

## Required gates

- Project 8 Agent Team v2 scope/risk validation.
- Reachable-history secret scan.
- Repository security baseline.
- Dependency security reporting/gate.
- Lint, typecheck, unit tests and production build.
- Disposable Project 8 database/widget verification including the owner-audit 401 no-store assertion.
- Exact-head reconciliation before merge.
