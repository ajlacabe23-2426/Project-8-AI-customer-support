Task ID: P8-NEXT-SECURITY-PATCH-2026-10-14
Title: Advance Next.js security patch to 15.5.28
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: a7c29505ec87ffc3f5d972818c2a0c592fe92a63

## Objective
Advance the existing Project 8 Next.js security candidate from 15.5.27 to the official 15.5.28 October 14 security release using npm-generated lockfile resolution. Preserve existing application behavior, tenant/auth boundaries, no-store protections, and advisory thresholds.

## Authorized implementation paths
- `package.json`
- `package-lock.json`
- `.codex/CURRENT_TASK.md`
- `.codex/handoffs/P8-NO-STORE-REMOTE-ACCEPTANCE-2026-10-12.md`
- `.github/workflows/one-time-next-2026-10-14.yml`
- `.github/workflows/verify.yml`

## Authorized test paths
- `tests/**`
- `lib/*.test.ts`

## Acceptance criteria
- Next and eslint-config-next resolve exactly 15.5.28.
- `npm regenerates registry resolutions/integrities; no hand-edited lock integrity.`
- Final candidate contains no temporary token-write regeneration workflow.
- `Strict npm ci, dependency policy, lint, typecheck, unit tests, build, secret/baseline checks pass.`
- `Contract and disposable database/widget verification pass on the same frozen candidate.`
- `Existing no-store/manual acceptance notes remain explicit and are not inferred from CI.`

## Explicit non-goals
- No auth, tenant, API, migration, provider, outbound messaging or hosted changes.
- No advisory suppression, secrets, paid services, merge or production deployment.
- No customer-affecting actions.
- Previous no-store acceptance remains separate from this dependency-only remediation.

## Required gates
- Agent Team v2 contract and scope.
- Verify Project 8; Security monitor.
- Disposable Project 8 database and widget verification.
- `Exact-SHA read-only diff/security review; remaining device checks reported.`
