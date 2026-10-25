Task ID: P8-VITEST-SECURITY-20261025
Title: Remediate moderate @vitest/mocker advisories on verified Windows-safe security candidate
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: 82eb71460febcc3ae6aef54c264d220ddee939f8

## Objective
Pin Vitest 4.1.12 with matching @vitest packages and verified integrity to remediate GHSA-qxg6-89mg-rqv8 and GHSA-xp26-3454-mjgp. Preserve the latest Project 8 Windows audit and App Router lint work without changing runtime code.

## Acceptance criteria
- npm ci, npm audit --include=dev --audit-level=moderate, dependency policy, lint and build PASS.
- All eight Vitest family package nodes carry patched version 4.1.12 and registry integrity.
- CI, Windows audit CLI, Security Monitor, disposable DB, widget and real browser acceptance pass on exact SHA.
- Keep Next.js, React, application, database and hosted configuration unchanged.
- Preserve no-fail-open audit, no exceptions, and all branch protection.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `package.json`
- `package-lock.json`

## Authorized test paths
- `scripts/security/audit-dependencies.node-check.mjs`

## Explicit non-goals
Do not merge main, deploy, use hosted Supabase or secrets, change authentication,
RLS, API/widget behavior, customer communication, billing or paid services.
Do not lower audit severity or extend an expired exception.

## Required gates
- Contract scope checks, Linux and Windows CI, security monitor, disposable Supabase.
- Device verification and lint coverage parity review before release decision.
