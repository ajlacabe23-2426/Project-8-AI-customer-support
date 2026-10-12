Task ID: P8-NEXT-SECURITY-PATCH-2026-10-12
Title: Reconcile Lenovo Next.js patch with the GitHub candidate
Status: READY_FOR_AJ
Risk Tier: TIER_2
Base SHA: a7c29505ec87ffc3f5d972818c2a0c592fe92a63

## Objective
Upgrade the GitHub candidate from Next.js 15.5.26 to the official 15.5.27 security release using an npm-generated lockfile. Preserve existing application behavior and advisory thresholds.

## Authorized implementation paths
- `package.json`
- `package-lock.json`
- `.codex/CURRENT_TASK.md`
- `.codex/handoffs/P8-NO-STORE-REMOTE-ACCEPTANCE-2026-10-12.md`
- `.github/workflows/one-time-next-lockfile.yml`
- `.github/workflows/verify.yml`

## Authorized test paths
- `tests/**`
- `lib/*.test.ts`

## Acceptance criteria
- Next and eslint-config-next resolve exactly 15.5.27.
- npm regenerates registry resolutions/integrities; no hand-edited lock integrity.
- Final candidate contains no temporary token-write regeneration workflow.
- Strict npm ci, dependency policy, lint, typecheck, unit tests, build, secret/baseline checks pass.
- Contract and disposable database/widget verification pass on the same frozen candidate.
- npm audit --omit=dev is reported separately from full-tree advisories and scoped expiring exceptions.
- Two-owner/widget/no-store manual checks remain explicit, not inferred from CI or an unrelated local audit.

## Explicit non-goals
- No auth, tenant, API, migration, provider, outbound messaging or hosted changes.
- No major framework upgrade, advisory suppression, secrets, paid services, merge or production deployment.
- Previous no-store acceptance is preserved in the handoff; it is not marked COMPLETE.

## Required gates
- Agent Team v2 contract and scope.
- Verify Project 8; Security monitor.
- Disposable Project 8 database and widget verification.
- Exact-SHA read-only diff/security review; remaining Lenovo checks reported.
