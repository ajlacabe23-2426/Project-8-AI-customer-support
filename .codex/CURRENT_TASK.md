Task ID: P8-DEPENDENCY-AUDIT-RECONCILIATION-20261019
Title: Remove patched Vitest advisory and expose expired unpatched lint-tooling risk
Status: CORRECTIONS_REQUIRED
Risk Tier: TIER_2
Base SHA: e34e148a74fafa259074b13859fd251f671a4c02

## Objective
Upgrade the test-only Vitest toolchain to a patched release, preserve all application code,
and document the October 18 expiry of the separately unpatched braces/Next ESLint advisory.
Avoid renewing a security exception without fresh risk acceptance. Preserve prior synthetic
browser evidence; hosted/device acceptance remains pending.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `package.json`
- `package-lock.json`
- `docs/security/DEPENDENCY_RISK_EXCEPTIONS.md`

## Authorized test paths
- Existing tests unchanged; re-run complete test suites.

## Acceptance criteria
- Vitest 4.1.11 eliminates GHSA-82fw-gwwq-j7x9 in patched test tooling.
- npm ci, lint, types, Vitest and Next build pass at the exact candidate SHA.
- Production-only dependency audit remains zero; no runtime package changes.
- High GHSA-VFJ7-8CJW-P6XM remains an explicit blocking issue, never silently waived.
- No Next/Supabase/auth/widget behavior, hosted resources or production data change.

## Explicit non-goals
- No security exception renewal, provider or runtime dependency changes.
- No hosted Supabase/configuration, migrations, secrets, paid services, customer email,
  retention execution or production deployment. No release-readiness claim.

## Required gates
- Agent Team v2 task-contract and scope.
- Verify Project 8: npm, lint, typecheck, Vitest and build.
- Security monitor; secret-history and dependency policy (known high advisory blocks).
- Disposable Supabase reset, RLS/widget tests, Chromium magic-link and two-owner
  acceptance against one exact candidate commit.
- Read-only review of dependency lockfile, runtime impact and unresolved advisory.
