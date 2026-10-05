Task ID: P8-RETENTION-PREVIEW-V1
Title: Add owner-configurable retention policy with preview-only deletion planning
Status: VERIFYING
Risk Tier: TIER_3
Base SHA: cc75894aa4f4072d61d60b108995bf5d5c0b6720

## Objective

Add a private-beta retention-policy foundation without enabling destructive automation. Workspace owners may choose a bounded conversation-retention target and inspect how many conversations would currently be eligible under that policy. No route, migration, workflow, cron, or provider is authorized to delete conversations automatically.

## Acceptance criteria

- Workspaces store a bounded 1-365 day conversation retention target with a safe default.
- Authenticated owners can read/update only their own workspace retention target under existing RLS.
- A server route returns the cutoff and eligible conversation count as an explicit preview.
- Cross-owner retention updates remain denied by RLS and are covered by the disposable two-owner verification.
- The implementation performs no automatic or batch deletion.
- Existing owner-initiated single-conversation deletion behavior is unchanged.
- Existing tenant, widget, lead-recovery, CORS, visitor-capability and dependency-security gates remain intact.

## Authorized implementation paths

- `.codex/CURRENT_TASK.md`
- `README.md`
- `lib/validation.ts`
- `app/api/admin/workspace/route.ts`
- `app/api/admin/retention/route.ts`
- `supabase/migrations/20261005000100_retention_policy_preview.sql`
- `tests/integration/project8.integration.mjs`

## Authorized test paths

- `tests/integration/project8.integration.mjs`

## Explicit non-goals

- No automatic conversation deletion.
- No cron/scheduled retention job.
- No deletion of backups, provider logs, or hosted data.
- No changes to visitor identity, authentication, tenant ownership, lead scoring, CRM, booking, email/SMS/voice, billing, or model-provider behavior.
- No hosted Supabase mutation.
- No production deployment or production configuration change.

## Required gates

- Project 8 Agent Team v2 scope/risk validation.
- Reachable-history secret scan.
- Repository security baseline.
- Dependency security reporting/gate.
- Lint, typecheck, unit tests and production build.
- Disposable Project 8 database/widget verification including cross-owner retention denial.
- Exact-head reconciliation before merge.
