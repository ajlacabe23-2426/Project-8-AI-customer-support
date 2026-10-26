Task ID: P8-NEXT-LINT-GAP-REVIEW-20261025
Title: Close priority Next App/Pages lint gaps without reintroducing vulnerable tooling
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: c441f15518b69c0bc81e8588680c8c7ad599d0d1

## Objective
Expand existing local Next-specific lint guards without reintroducing the vulnerable Next-eslint fast-glob/braces chain. Alongside existing stylesheet, polyfill.io and next/head checks, add static checks for inline script identifiers, Pages Router beforeInteractive placement, styled-jsx in _document, nested Script in Head, direct async Client Components, and document/head import misuse. Preserve explicit documentation of remaining upstream parity gaps.

## Acceptance criteria
- npm ci, expanded lint guard fixtures, npm run check, Linux/Windows workflow checks, task contract, disposable local database/widget/Chromium acceptance and security monitor PASS at exact SHA.
- No unpatched glob development tree or dependency lockfile changes.
- Document scoped rule coverage and known official parity gaps without false claims of parity or production readiness.
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
No production deploy, hosted migrations, server settings, billing or customer-facing actions. Owner-approved integration merge may proceed only after all required exact-head checks pass; this task does not approve a production release.

## Required gates
Task-contract scope, exact-head CI and security monitor, disposable owner/browser acceptance, explicit review of scoped lint-equivalence gaps, and a separate production release GO/NO-GO.
