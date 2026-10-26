Task ID: P8-CONSOLIDATED-SECURITY-INTEGRATION-20261026
Title: Verify merged Project 8 dependency and scoped lint remediation
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: e34e148a74fafa259074b13859fd251f671a4c02

## Objective
Reconcile the active task contract with the owner-approved consolidated security integration now on main. The integration includes patched dependencies and lockfile, a Windows-safe npm audit launcher, expanded scoped Next.js lint guards, their tests and CI wiring. The prior task described only the final stacked lint increment and caused post-merge CI to reject the broader merge diff. No additional runtime or hosted changes are introduced by this contract correction.

## Acceptance criteria
- Compare all combined security changes against the frozen pre-integration main SHA.
- Permit only the exact files changed by the merged security integration.
- Require Linux application verification, Windows audit regression, security monitor, Agent Team contract, and disposable owner/widget/browser acceptance on the corrected integration candidate and merged main.
- Preserve high/critical advisory blocking; disclose that local lint guards are not full Next.js recommended/Core Web Vitals parity.
- No customer-data or public production release declaration.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `.github/workflows/verify.yml`
- `docs/security/DEPENDENCY_RISK_EXCEPTIONS.md`
- `docs/security/NEXT_LINT_GAP_REVIEW_20261025.md`
- `eslint.config.mjs`
- `lint/next-core-guards.mjs`
- `package-lock.json`
- `package.json`
- `scripts/security/audit-dependencies.mjs`

## Authorized test paths
- `lint/next-core-guards.node-check.mjs`
- `scripts/security/audit-dependencies.node-check.mjs`

## Explicit non-goals
No runtime API, Auth, RLS, database migration, production infrastructure, secrets, hosted configuration, billing, customer data, or customer-facing release changes. This task does not grant future changes outside the exact integration paths above or full upstream Next lint parity.

## Required gates
Task-contract diff against frozen pre-integration main, exact-head tests and security monitoring, disposable two-owner Chromium verification, post-merge CI, and separate hosted production release GO/NO-GO.
