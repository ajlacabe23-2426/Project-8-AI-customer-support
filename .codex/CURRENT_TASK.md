Task ID: P8-CALLBACK-COOKIE-REDIRECT-2026-10-16
Title: Bind magic-link session cookies to callback redirect response
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: 63ad234d2ca2eb2a4d1c42c7ff5d6daa7f9b4994

## Objective
Investigate owner-recorded email-link loop: Inbucket/Mailpit link returns to login instead of a proven authenticated dashboard. Harden the auth callback to attach cookies from `exchangeCodeForSession` to the exact `NextResponse.redirect('/dashboard')` sent to the browser. This is a hypothesis-driven engineering change, not proof of the root cause or a completed browser acceptance.

## Authorized implementation paths
- `app/auth/callback/route.ts`
- `.codex/CURRENT_TASK.md`

## Authorized test paths
- `app/auth/callback/route.test.ts`

## Acceptance criteria
- Successful code exchange propagates session cookies (including options) to the response actually returned to the browser, preserving the request's cookie state for the handler.
- Missing code, invalid code, absent public configuration or provider exception fail closed to generic login feedback and do not reveal raw errors or session cookies.
- Callback response uses no-store cache policy.
- Exact-head task contract, lint, types, unit tests, Next build, repository security monitor and disposable Project 8 DB/widget CI pass.
- Manual browser email-link, refresh, account switch and two-owner isolation remain separately NOT VERIFIED until observed on this candidate.

## Explicit non-goals
- No auth email template changes, local or hosted Supabase config/keys, middleware, tenant ownership, RLS, migrations or service role access changes.
- No production/customer messages, customer data, paid providers, hosted operations, main merge, release, rollback of other projects or Axiovela changes.
- No claim that the patch fixes the loop unless the owner verifies a new local attempt.

## Required gates
- Agent Team v2 changed-file scope & task contract.
- Security Monitor; Verify Project 8; disposable DB/widget; read-only exact-SHA review.
- Verify selected local project, redirect host/path, presence (never value) of response cookies, same-browser magic-link exchange, two-account/tenant isolation.
- Preserve base PR #24 and security PR #17 unmerged until independent approval.

## Observed evidence
- Owner's 2026-10-16 video shows email-link click returning to the Project 8 login page. It does not demonstrate a successful authenticated dashboard session.
- Existing callback calls `userDb()`, exchanges a code, then creates a separate redirect. The explicit response-cookie adapter removes uncertainty over where exchanged-session cookies are attached, but may not address local redirect allowlisting, expired links or email template mismatches.
