Task ID: P8-LUCIDE-MAJOR-20261117
Title: Integrate reviewed lucide-react major upgrade and peer metadata
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: 6b17eafc479a44d163085e58430b2240b00e118f

## Objective
Reconcile superseded Dependabot #46 against current Zod and Node type dependency baseline, preserving all other package versions and application functionality.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `package.json`
- `package-lock.json`

## Authorized test paths
- `tests/integration/project8.integration.mjs`

## Acceptance criteria
- Only lucide-react changes from 0.468 to 1.72 and associated package lock peer metadata; preserve Zod 4.6.7 and Node types 26.6.6.
- All four exact-head application, security, agent contract and disposable tenant/browser workflows pass.
- No regression to auth, support, qualified lead isolation or display.

## Explicit non-goals
No hosted migrations, deployment, vendor spending, publishing, user data changes, unrelated major upgrades or reduction in security checks.

## Required gates
Exact-head lint, TypeScript, tests, build, permission-negative integration tests and security validation before merge.
