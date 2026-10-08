Task ID: P8-PRIVATE-ADMIN-NO-STORE-V1
Title: Harden owner-console API response caching
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: 7ec458e2936ef97dd08329b907b7e81bc69e890b

## Objective
Mark owner-facing lead, knowledge and conversation responses non-cacheable on all paths, including authentication errors, rejected inputs and failures.

## Authorized implementation paths
- `lib/private-response.ts`
- `app/api/admin/leads/route.ts`
- `app/api/admin/knowledge/route.ts`
- `app/api/admin/conversations/route.ts`
- `.codex/CURRENT_TASK.md`

## Authorized test paths
- `lib/private-response.test.ts`

## Acceptance criteria
- Owner endpoints use a common no-store JSON helper on success and failures.
- Existing status codes, response shapes, RLS and authorization paths remain unchanged.
- The helper enforces no-store despite a caller-supplied cache header.
- Unit tests confirm success/error statuses and header behavior.
- Lint, typecheck, tests, build, security, agent contract, and disposable database/widget gates remain green.

## Explicit non-goals
- No hosted Supabase mutations, RLS/migrations or production deploy.
- No new customer messages, model calls, billing, credentials or retention operations.
- No changes to anonymous widget authentication or capabilities.

## Required gates
- Agent Team v2 contract verification, Security Monitor, app checks and disposable Project 8 database/widget verification.
