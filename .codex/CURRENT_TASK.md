Task ID: P8-NEXT-CORE-LINT-GUARDS-20261020
Title: Reintroduce core Next-specific lint protections without vulnerable glob tooling
Status: IMPLEMENTING
Risk Tier: TIER_2
Base SHA: e34e148a74fafa259074b13859fd251f671a4c02

## Objective
Restore an explicit, locally enforced subset of Next.js web-vitals and App Router
lint safeguards as an isolated whole-integration candidate inheriting verified PR #33. Keep no
eslint-config-next/@next/eslint-plugin-next dependency until braces advisory has
a trusted upstream resolution; do not claim full official plugin equivalence.

## Acceptance criteria
- Enforce static JSX <img>, internal HTML <a>, synchronous script, raw <head>
  and prohibited app-router next/document imports with locally reviewed rules.
- Enforce unsafe target=_blank links missing rel protections.
- Unit/integration regressions exercise ESLint's actual configuration with valid
  and invalid examples. No silent deactivation or duplicate fallback.
- No dependency or application behavior changes beyond the audited inherited PR #33 integration; no new runtime deps.
- Every exact-head workflow passes: contract, Security Monitor, app lint/types/
  tests/build, Windows audit regression, disposable database/widget/Chromium.
- Evidence includes rule coverage map and residual gaps vs official Next plugin.
- Owner device and hosted auth two-account acceptance remain independent.
- Never remove dependency security blocks or change waiver expiry.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `eslint.config.mjs`
- `package.json`
- `package-lock.json`
- `scripts/security/audit-dependencies.mjs`
- `.github/workflows/verify.yml`
- `docs/security/DEPENDENCY_RISK_EXCEPTIONS.md`
- `lint/next-core-guards.mjs`

## Authorized test paths
- `lint/next-core-guards.node-check.mjs`
- `scripts/security/audit-dependencies.node-check.mjs`

## Explicit non-goals
No merging to main, direct production deploy, hosting updates, Supabase hosted
changes, customer email, secrets, paid service, or package installation/override.
Do not impersonate the official @next/next ESLint plugin or suppress the build
warning. Do not claim complete parity until a reviewed supported replacement.

## Required gates
- Exact head agent-team contract, GitHub Verify Project 8, Security Monitor.
- Exact head disposable Supabase browser, widget and owner-isolation acceptance.
- Windows runner regression and user Lenovo recheck before release acceptance.
- Review Next.js-specific rule coverage vs core-web-vitals documentation.
- Owner approval before merge or deployment.
