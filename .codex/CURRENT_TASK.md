Task ID: P8-AUDIT-TOOLING-INTEGRATION-20261020
Title: Integrate audited Windows CLI repair and development-tool dependency remediation
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: e34e148a74fafa259074b13859fd251f671a4c02

## Objective
Integrate tested Windows audit launcher PR #32 with the dependency tree from PR #31, directly against the unchanged main base.
Stage patched Vitest/Vite tooling and drop the unpatched braces glob chain from
the active dependency lockfile without waiving the expired advisory. Exclude
PR #31's temporary write-capable GitHub Actions lockfile-refresh workflow.

## Acceptance criteria
- No write-capable workflow or insecure persistent checkout token.
- npm ci, lint, typecheck, unit tests, build and exact-head disposable DB.
- Both Linux and Windows launch-test suites pass; zero production advisories.
- Full npm audit must report no high/critical unremediated advisories.
- No nested braces / micromatch / fast-glob / eslint-config-next packages remain.
- Verify that replacing eslint-config-next did not silently drop needed Next.js
  and React lint coverage; keep release HOLD until parity review complete.
- Owner tests this exact SHA on the Lenovo; never reuse PR #32 test evidence as
  proof that this new combined candidate passes.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `scripts/security/audit-dependencies.mjs`
- `.github/workflows/verify.yml`
- `package.json`
- `package-lock.json`
- `eslint.config.mjs`
- `docs/security/DEPENDENCY_RISK_EXCEPTIONS.md`

## Authorized test paths
- `scripts/security/audit-dependencies.test.mjs`

## Explicit non-goals
Do not merge main, deploy, use hosted Supabase or secrets, change authentication,
RLS, API/widget behavior, customer communication, billing or paid services.
Do not add temporary audit exception, change its October 18 expiry, or disable
high/critical checks. No elevated GitHub Actions permissions.

## Required gates
- Agent Team v2 task contract and changed-path scope.
- Verify Project 8 including Linux and Windows audit subprocess regression.
- Security Monitor, reachable-history secret scan and full dependency policy.
- Disposable database, RLS, widget and browser verification.
- Read-only review of lint-rule coverage parity and runtime lockfile diff.
- Owner Lenovo audit and eventual two-account browser acceptance.
