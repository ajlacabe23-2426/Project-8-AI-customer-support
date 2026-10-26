Task ID: P8-READINESS-GATES-20261025
Title: Verify isolated local product readiness without authorizing paid launch
Status: VERIFYING
Risk Tier: TIER_1
Base SHA: e34e148a74fafa259074b13859fd251f671a4c02

## Objective
Add reversible, dependency-free checkout readiness diagnostics and regression
tests so the Project 8 candidate cannot be presented as paid-customer-ready
based on a passing build alone. Preserve existing production trust boundaries.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `scripts/release-gate.mjs`
- `package.json`

## Authorized test paths
- `tests/release-gate.test.mjs`

## Acceptance criteria
- Preflight reports missing migrations, expected app files and CI setup without
  reading production environment variables or secrets.
- Incomplete checkouts must be reported as failures.
- Results explicitly declare public deployment, billing, customer data and
  hosted database changes unapproved and unverified.
- Node tests are executed by the normal npm test script.
- The same frozen commit passes Agent Team task contract, standard CI, security
  monitoring and disposable database verification before review.
- Failing tests must be corrected; no claims of a production release.

## Explicit non-goals
- No modification to Supabase auth, database RLS, migrations, network endpoints,
  visitor widgets, secrets, paid providers or production deployments.
- No merge into main, release promotion, customer email or customer data.
- No claims of verified revenue, production security or legal compliance.
- The earlier P8 real-browser acceptance task remains independent and must not
  be represented as completed by this narrow readiness task.

## Required gates
- Existing Agent Team v2 task/scope validation; do not weaken its rules.
- npm dependency audit and lockfile integrity.
- npm lint, typecheck, test and build on the exact review SHA.
- Security monitor, secret history and dependency policy.
- Existing disposable two-owner RLS/widget/browser acceptance as applicable.
- Human review of any eventual main merge or hosted changes.
