Task ID: P8-OWNER-AUDIT-TRAIL-V1
Title: Add tenant-isolated owner audit evidence for sensitive admin actions
Status: VERIFYING
Risk Tier: TIER_3
Base SHA: 6af30f583b24d09f8cc18d34627450de0ea12b6a

## Objective

Add a private-beta audit-evidence foundation for sensitive owner actions without introducing destructive automation or cross-tenant visibility. The database records bounded metadata for retention-policy changes and owner-initiated conversation deletion, and authenticated owners can inspect only their own workspace audit history.

## Acceptance criteria

- Audit events are stored in a dedicated RLS-protected workspace table.
- Authenticated owners can read only audit events for workspaces they own.
- Authenticated clients cannot insert, modify, or delete audit events directly.
- Retention-policy changes record previous/new day values without message content or secrets.
- Conversation deletion records the deleted conversation id and workspace id without preserving deleted message content.
- Cross-owner reads and writes remain denied and covered by disposable two-owner verification.
- A no-store admin route exposes bounded owner audit history.
- Existing tenant, widget, lead-recovery, retention-preview, CORS, visitor-capability and dependency-security gates remain intact.

## Authorized implementation paths

- `.codex/CURRENT_TASK.md`
- `README.md`
- `app/api/admin/audit/route.ts`
- `supabase/migrations/20261006000100_owner_audit_trail.sql`
- `tests/integration/project8.integration.mjs`

## Authorized test paths

- `tests/integration/project8.integration.mjs`

## Explicit non-goals

- No logging of message bodies, contact details, API keys, session capabilities, or model prompts.
- No automatic conversation deletion or retention scheduler.
- No hosted Supabase mutation.
- No production deploy or production configuration change.
- No billing, CRM, booking, email/SMS/voice, or model-provider changes.
- No cross-project infrastructure.

## Required gates

- Project 8 Agent Team v2 scope/risk validation.
- Reachable-history secret scan.
- Repository security baseline.
- Dependency security reporting/gate.
- Lint, typecheck, unit tests and production build.
- Disposable Project 8 database/widget verification including audit RLS and trigger assertions.
- Exact-head reconciliation before merge.
