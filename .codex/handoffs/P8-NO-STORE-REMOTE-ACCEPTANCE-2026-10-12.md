# Project 8 no-store verification handoff — 2026-10-12

Previous task: P8-PRIVATE-OWNER-ENDPOINT-NO-STORE-V2. Preserve owner acceptance as pending; no COMPLETE state is inferred.

## Exact application revision
`a7c29505ec87ffc3f5d972818c2a0c592fe92a63` (current main at reconciliation).

## Executed remote evidence
- Verify Project 8 run 38003479120 PASS: strict npm ci, secrets, baseline, dependency policy, lint, typecheck, 22/22 unit tests and build.
- Agent Team v2 contract run 38003479062 PASS.
- Disposable database/widget run 38003479244 PASS: actual local two-owner workspace, knowledge, conversations, messages, audit RLS, rate limits, widget history/CORS, hashed capability persistence, cross-origin denial and malformed-session rejection.
- Latest Security monitor run 38304025224 PASS at this exact revision.
- Full-tree audit at October 9 verification reported 8 vulnerabilities (3 moderate, 5 high); 5 high findings accepted only under existing narrow temporary policy. This is not a zero-vulnerability full-tree claim.

## Device evidence
AJ reported a zero-vulnerability production-only Windows audit October 11. Current GitHub main still resolves Next 15.5.26. The newer local dependency change has no matching captured/pushed candidate; do not attach that result to main.

## Remaining checks on final patched candidate
- Owners A and B: workspace, knowledge, leads, conversations and audit isolation across switching/reload on an isolated local/disposable instance.
- Success/401/validation owner responses have Cache-Control: no-store.
- Allowed and rejected widget origins, fresh visitor sessions and isolation of different session histories.
- Retention remains preview-only; no deletion execution or customer messages.
- Capture git rev-parse HEAD with Windows npm.cmd audit --omit=dev and npm.cmd run check.

## Original active contract (preserved)
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

