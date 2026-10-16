Task ID: P8-REAL-BROWSER-AUTH-ACCEPTANCE-20261016
Title: Automate local magic-link and two-owner browser acceptance
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: f2d30c8a17355b1a81aaccbb579d8cf561b92238

## Objective
Replace repeated manual guessing about issue #22 with an automated disposable Chromium
test that requests the actual app email magic link, reads only local Inbucket,
uses the same browser session to follow it, checks dashboard/refresh, and verifies
cross-owner workspace and knowledge isolation. Inherit combined PR #27 code unchanged.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `.github/workflows/database-verification.yml`

## Authorized test paths
- `tests/acceptance/magic-link.browser.cjs`

## Acceptance criteria
- Only GitHub CI disposable Supabase at 127.0.0.1:54321 and local Next.js
  at 127.0.0.1:3118 may be used; email comes from local Inbucket port 54324.
- The browser requests OTP through actual UI, consumes a verified local-only
  confirmation link in the same browser context, reaches authenticated dashboard,
  creates a synthetic workspace, reloads, and keeps the workspace visible.
- A second fresh browser context signs in with separate synthetic email;
  cannot list A workspace, access A knowledge, or insert to A workspace.
- Unexpected external requests fail rather than reaching real services.
- No real secrets, email content, confirmation codes or live data are printed.
- Workflow gates remain strict; this CI browser test must fail closed if
  links are missing, redirect destination is wrong, session fails, or tenant leaks.
- Exact-head task contract, Verify Project 8, Security monitor and disposable
  DB/widget/browser verification all PASS on one SHA before engineering acceptance.

## Explicit non-goals
- No production auth/email templates, hosted Supabase, migrations, network
  allowlisting, provider credentials, live customer email or browser user secrets.
- No main merge, production deployments, paid services or real customer data.
- Even passing disposable browser CI is not hosted production acceptance;
  owner validates the browser experience on a real device before release.

## Required gates
- Agent Team v2 task-contract and scope.
- Verify Project 8: npm, lint, typecheck, Vitest and build.
- Security monitor; secret-history and dependency policy.
- Disposable Supabase reset, RLS/widget tests, Chromium magic-link and two-owner
  acceptance against one exact candidate commit.
- Read-only review of test isolation, failure handling, and browser network guard.
