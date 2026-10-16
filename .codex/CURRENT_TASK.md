Task ID: P8-CALLBACK-COOKIE-REDIRECT-2026-10-16
Title: Persist callback cookies and distinguish safe authentication failure stages
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: 63ad234d2ca2eb2a4d1c42c7ff5d6daa7f9b4994

## Objective
Investigate owner-recorded email-link loop: Inbucket/Mailpit link returns to login instead of a proven authenticated dashboard. Harden the auth callback to attach cookies from `exchangeCodeForSession` to the exact `NextResponse.redirect('/dashboard')` sent to the browser. This is a hypothesis-driven engineering change, not proof of the root cause or a completed browser acceptance.

## Authorized implementation paths
- `app/auth/callback/route.ts`
- `app/dashboard/page.tsx`
- `lib/auth-feedback.ts`
- `.codex/CURRENT_TASK.md`

## Authorized test paths
- `app/auth/callback/route.test.ts`
- `lib/auth-feedback.test.ts`

## Acceptance criteria
- Successful code exchange propagates session cookies (including options) to the response actually returned to the browser, preserving the request's cookie state for the handler.
- Missing code, invalid code, absent public configuration or provider exception fail closed to generic login feedback and do not reveal raw errors or session cookies.
- Callback response uses no-store cache policy.
- Redirects reveal only a fixed stage marker (missing_code, missing_config, exchange_failed, exception, no_session) without exposing auth codes, error messages, email addresses or cookie values.
- The login notice provides fixed non-reflective stage guidance and retains generic messaging for unknown input.
- Missing code vs failed exchange vs dashboard session rejection must be distinguishable after one new owner browser attempt.
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

## 2026-10-16 evidence-first diagnostic extension
Owner reported multiple attempts looping back to login without ever reaching a usable workspace. To prevent further guessing, this branch adds fixed stage-specific feedback. All messages are server-authored, bounded and non-reflective; the browser must never provide full URLs with tokens or cookie values in bug reports. The GitHub review/CI gates must be rerun on this exact head. Until the owner sees a working session on the intended checkout, browser acceptance remains FAILED and release/merge remain prohibited.
