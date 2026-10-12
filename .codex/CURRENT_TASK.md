Task ID: P8-TEST-TOOLING-ADVISORY-2026-10-12
Title: Remove the patched Vitest development advisory and pin exact-head verification
Status: READY_FOR_AJ
Risk Tier: TIER_2
Base SHA: a7c29505ec87ffc3f5d972818c2a0c592fe92a63

## Objective
Preserve Next.js 15.5.27 from PR #17, replace vulnerable Vitest 3 tooling with exact patched 4.1.11, regenerate npm lockfile in an empty directory and verify the same candidate across all gates.

## Authorized implementation paths
- `package.json`
- `package-lock.json`
- `.codex/CURRENT_TASK.md`
- `.codex/handoffs/P8-NO-STORE-REMOTE-ACCEPTANCE-2026-10-12.md`
- `docs/security/DEPENDENCY_RISK_EXCEPTIONS.md`
- `.github/workflows/verify.yml`
- `.github/workflows/database-verification.yml`
- `.github/workflows/security-monitor.yml`
- `.github/workflows/agent-team-v2.yml`

## Authorized test paths
- `tests/**`
- `lib/*.test.ts`

## Acceptance criteria
- Exact Vitest and mocker 4.1.11 remove GHSA-82fw-gwwq-j7x9.
- Runtime dependency versions/integrities match #17; Next/eslint-config-next remain 15.5.27.
- npm ci, lint, typecheck, 22 unit tests, build, contract/scope, security and disposable DB/widget pass at final head.
- Production audit is zero; full audit has only the existing five dev-chain high findings.
- Existing braces exception identity/scope/expiry remains unchanged; no new suppression.
- Every workflow explicitly checks out PR head for PR events and github.sha otherwise.
- Previous no-store acceptance and remaining two-owner device checks are preserved; no COMPLETE inferred.

## Explicit non-goals
- No app framework upgrade, auth/API/RLS/migration/provider/customer-data/hosted change.
- No exception extension, secrets, paid resources, main merge, production deploy or customer messages.

## Required gates
- Agent Team v2 contract/scope, Verify Project 8, Security monitor, disposable Project 8 DB and widget verification.
- Exact-head scoped review and honest owner acceptance handoff.

## Local source verification
Lint/typecheck, 22/22 tests and build PASS with patched tooling; production audit zero; full audit 0 moderate / 5 high; unchanged scoped policy PASS. Node 22 CI is the verification target. Final candidate CI/DB/security must pass before READY_FOR_AJ is delivered.
