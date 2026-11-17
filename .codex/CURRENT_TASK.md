Task ID: P8-DEPENDENCY-MAINTENANCE-2026-11-16
Title: Reconcile routine dependency and pinned workflow updates
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: 3765a1666877333349a6beb98847136e98e52705

## Objective
Preserve the merged LeadFlow CX foundation and existing release gates while integrating Zod 4.6.7 and the two reviewed pinned Actions changes from PRs #21, #43 and #45. Prior task evidence remains at the merged #55 commit.

## Acceptance criteria
- Exact Zod patch and matching lockfile; no unrelated dependency changes.
- Replace only the specified setup-node/setup-python action pins and leave runtime versions, security checks and verification workflows intact.
- Full application CI, task contract, security, Windows and disposable database/browser checks pass on combined head.
- No hosted configuration or real customer changes.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `package.json`
- `package-lock.json`
- `.github/workflows/database-verification.yml`
- `.github/workflows/security-monitor.yml`
- `.github/workflows/verify.yml`
- `.github/workflows/agent-team-v2.yml`

## Authorized test paths
- `tests/integration/project8.integration.mjs`

Existing integration test is authorized for verification; no test-source edits are planned.

## Explicit non-goals
No major toolchain changes, hosted migration, deployment, real data, external provider activity or weakening RLS, tests or release gates.

## Required gates
Exact-head task contract, npm check/build, security, Windows audit and disposable database/browser verification. No commercial readiness claim.
