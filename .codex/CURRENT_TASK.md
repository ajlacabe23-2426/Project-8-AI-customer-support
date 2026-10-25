Task ID: P8-NEXT-LINT-GAP-REVIEW-20261025
Title: Strengthen independent Next JSX lint guards and document remaining coverage gaps
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: c441f15518b69c0bc81e8588680c8c7ad599d0d1

## Objective
Expand the existing local Next-specific lint rules without reintroducing the vulnerable Next-eslint fast-glob/braces chain. Add focused stylesheet, polyfill.io and App Router next/head checks, test positive and negative cases, and maintain explicit disclosure that official Next lint parity remains open.

## Acceptance criteria
- npm ci, lint guard tests, npm run check, Linux/Windows workflow checks and security monitor PASS at exact SHA.
- No unpatched glob development tree or dependency lockfile changes.
- Document current rule coverage and known official parity gaps without false release claims.
- No application runtime behavior changes, hosted requests or secrets.

## Authorized implementation paths
- `lint/next-core-guards.mjs`
- `eslint.config.mjs`
- `docs/security/NEXT_LINT_GAP_REVIEW_20261025.md`
- `.codex/CURRENT_TASK.md`

## Authorized test paths
- `lint/next-core-guards.node-check.mjs`

## Explicit non-goals
No dependency waiver, npm policy relaxation, customer data, auth, RLS, API or widget changes.
No merge to main, production deploy, server settings, billing or customer-facing actions.

## Required gates
Task-contract scope, exact-head CI and security monitor and disposable local database, lint-equivalence owner review, user two-account acceptance and release GO/NO-GO.
