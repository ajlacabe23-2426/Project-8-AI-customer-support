Task ID: P8-AUTH-CALLBACK-FEEDBACK-2026-10-16
Title: Explain failed magic-link callbacks without changing authentication
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: 1ce5e9c9079a7ea34c137d39c959dcfc59999849

## Objective
Surface the existing `/auth/callback` failure redirect (`/login?error=auth`) as a concise, actionable, non-reflective message. This does not diagnose or repair the underlying owner-reported email-link login loop (issue #22).

## Authorized implementation paths
- `app/login/page.tsx`
- `lib/auth-feedback.ts`
- `.codex/CURRENT_TASK.md`

## Authorized test paths
- `lib/auth-feedback.test.ts`

## Acceptance criteria
- Failed callback redirects to `/login?error=auth` are visibly explained.
- Normal login remains unchanged and no arbitrary query string is reflected into the DOM.
- Existing email submission, callback/session/cookie handling, tenant ownership and RLS remain unchanged.
- Exact-head lint, typecheck, tests, build, task contract, security and disposable DB/widget workflows pass before READY_FOR_AJ.
- Owner still performs same-origin magic-link acceptance and two-owner/tenant-isolation tests; issue #22 remains open until proven.

## Explicit non-goals
- No change to sign-in provider settings, callback exchange, middleware, session cookies, Supabase databases, migrations or access rules.
- No external mail, customer data, hosted settings, secrets, spending, main merge, production deployment or account publication.
- Do not claim that displaying an error fixes the failed login flow.

## Required gates
- Agent Team v2 contract and changed-file scope.
- Verify Project 8 lint/typecheck/unit/production build and dependency security.
- Security monitor and disposable Project 8 database/widget verification on frozen exact SHA.
- Source diff review for auth/data impact and pending manual browser acceptance.

## CI branch and review discipline
- The `feat/**` branch convention is required for the existing Verify and Security Monitor push filters; a `fix/**` branch would omit those gates.
- This branch is stacked on security PR #17 and must remain draft until exact-head checks and owner testing are reconciled.
