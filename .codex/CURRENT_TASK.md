Task ID: P8-PRIVATE-BETA-PREVIEW-V1
Title: Add a non-production product preview route
Status: IMPLEMENTING
Risk Tier: TIER_1
Base SHA: a72694830a552879370d2e812de99743ed244f3d

## Objective

Add a static, non-production preview route that lets AJ inspect the Project 8 product surface without requiring authentication, customer data, hosted Supabase changes, or provider credentials.

## Acceptance criteria

- `/preview` renders without authentication or database access.
- The preview is clearly labeled as illustrative/private-beta material.
- The preview reuses the existing public product surface and does not expose owner-console data.
- Search engines are instructed not to index or follow the preview route.
- No production deployment, hosted database mutation, secrets change, customer messaging, or billing action is introduced.
- Existing application, security, widget, tenant-isolation and dependency gates remain green.

## Authorized implementation paths

- `.codex/CURRENT_TASK.md`
- `app/preview/page.tsx`

## Authorized test paths

- `app/preview/page.tsx`

## Explicit non-goals

- No production deployment.
- No hosted Supabase mutation.
- No auth, RLS, database, provider, billing, CRM, email/SMS/voice, or model-provider changes.
- No real customer data or live support activity.

## Required gates

- Project 8 Agent Team v2 scope/risk validation.
- Reachable-history secret scan.
- Repository security baseline.
- Dependency security reporting/gate.
- Lint, typecheck, unit tests and production build.
- Exact-head reconciliation before merge.
