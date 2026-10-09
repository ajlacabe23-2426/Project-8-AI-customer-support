Task ID: P8-PRIVATE-OWNER-ENDPOINT-NO-STORE-V2
Title: Complete owner-workspace and retention no-store coverage
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: 0fa80e41b8216b8ab8cbb240d4c4d0e76ac12433

## Objective
Extend the verified privateJson response helper to workspace management and retention previews, preventing owner-specific data and authentication failures from being cached on every route path.

## Authorized implementation paths
- `app/api/admin/workspace/route.ts`
- `app/api/admin/retention/route.ts`
- `.codex/CURRENT_TASK.md`

## Authorized test paths
- `tests/integration/project8.integration.mjs`

## Acceptance criteria
- Owner workspace GET/POST/PATCH use privateJson on successes and errors.
- Retention preview GET/PATCH use privateJson on successes and errors.
- No response shape or status code changes, tenant/auth/RLS changes, or database migrations.
- Disposable integration tests verify the real unauthenticated Next.js endpoints return 401 with no-store.
- Agent Team contract, security, lint, typecheck, build, unit and disposable database/widget verification pass.

## Explicit non-goals
- No hosted Supabase, retention execution or production deployment.
- No new credentials, customer data, billing, outbound messages or providers.
- No anonymous widget capability changes.

## Required gates
- Agent Team v2 contract, Security monitor, Verify Project 8, Disposable Project 8 database/widget verification.
