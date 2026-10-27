Task ID: P8-RELEASE-PREFLIGHT-RECONCILIATION-2026-10-27
Title: Reconcile local release preflight on patched Project 8 main
Status: VERIFYING
Risk Tier: TIER_1
Base SHA: 004416036e6d304766baae2af1b69f3cf3d08aad

## Objective
Integrate the self-contained fail-closed checkout preflight and tests from reviewed draft PR #38 onto the current patched main without importing its stale branch. Strengthen release claims so application build success cannot be misrepresented as hosted two-owner, billing or production acceptance. No production runtime code, hosted database or credentials change.

## Acceptance criteria
- Preflight inspection asserts only presence of checkout dependencies, migration source and workflows.
- Missing required inputs fail closed; release report explicitly refuses production, revenue, hosted migration and customer-data sign-off.
- Standard npm test command runs both existing Vitest suite and preflight Node tests.
- Verify on exact PR head: test, lint, TypeScript, production build, security monitor, Agent Team scope and disposable database/widget workflows.
- No claims of actual hosted release readiness or customer onboarding beyond evidence.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `package.json`
- `scripts/release-gate.mjs`

## Authorized test paths
- `tests/release-gate.node-check.mjs`

## Explicit non-goals
No Auth, RLS, API, database migration, production release, billing, email delivery, external customer data, secrets or hosted deployment; only local preflight checks. This is not a paid-beta GO decision.

## Required gates
Full exact-head application checks, security, Agent Team and isolated database/widget verification, code review, owner-approved merge and separate hosted browser acceptance before any production readiness claim.
