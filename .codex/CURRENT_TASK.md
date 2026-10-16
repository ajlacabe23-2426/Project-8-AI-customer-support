Task ID: P8-AUTH-WIDGET-INTEGRATION-2026-10-16
Title: Reconcile callback and streamed request security on a single candidate
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: 7ade88d7f67ef702163f5f7732283ae5e587b6a9

## Objective
Create an isolated, explicitly stacked combined candidate containing verified
magic-link callback-cookie/relative-host correction PR #25 and bounded anonymous
widget-body security fix PR #26. Preserve both upstream branches. Add real HTTP
disposable integration assertions for their unchanged relevant behavior.

## Authorized implementation paths
- `app/api/chat/route.ts`
- `app/api/history/route.ts`
- `lib/bounded-body.ts`
- `.codex/CURRENT_TASK.md`

## Authorized test paths
- `lib/bounded-body.test.ts`
- `tests/integration/project8.integration.mjs`

## Acceptance criteria
- Preserve exact PR #25 auth callback and dashboard behavior without editing those paths.
- Chat/history no longer materialize unbounded incoming streams. Actual cap: chat
  5000 bytes; history 256 bytes. Content-Length is never trusted as a full defense.
- Handle malformed body streams safely without reflecting errors or leaking account data.
- Vitest helper tests cover chunking, UTF-8, missing/dishonest length and read errors.
- Disposable integration asserts missing auth code redirects with no-store and no cookie;
  valid chunked history and oversized chunked history/chat return expected statuses.
- Keep auth callback synthetic test coverage from inherited PR #25.
- All four required GitHub workflows pass on the same frozen candidate SHA.
- Scope/risk checks confirm only authorized implementation and test paths were changed.

## Explicit non-goals
- No production magic-link email or verified browser-session claim.
- No changes to Supabase auth provider config, email templates, allowed URLs,
  tenants, RLS, migrations, production environments, secrets, accounts or billing.
- No `main` merge, production deployment, live customer messages, or paid resources.
- Do not imply PR #26 or #25 is merged because this stacked candidate passes.
- Vitest dev-dependency PR #18 remains independent; integrate only with new testing
  and explicit approval.

## Required gates
- Agent Team v2 contract and diff scope.
- Verify Project 8 (strict npm ci, lint, typecheck, unit, build, dependency checks).
- Security Monitor (secrets/history/security baseline and dependency audit).
- Disposable Project 8 database/widget integration including HTTP assertions.
- Read-only exact SHA review.
- Owner on-device same-browser magic-link login/refresh/two-owner isolation still required.

## Evidence
- Parent auth PR #25 frozen at 7ade88d7f67ef702163f5f7732283ae5e587b6a9.
- Security source copied from independently verified PR #26 head
  ac62c2350f1459f36e5502326da4f666a08efe23, not cherry-picked as a merge.
- This contract targets only changes since the parent; upstream auth/security
  test claims cannot replace checks of the combined head.
