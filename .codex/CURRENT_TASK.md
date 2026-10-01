Task ID: P8-SECURITY-CONTROL-PLANE-V1
Title: Establish reusable repository security control plane
Status: IMPLEMENTING
Risk Tier: TIER_1
Base SHA: 8c05e0f0c1caf1687fbef748b2f289a0dd85832f

## Objective

Port the verified defensive repository controls from Axiovela into Project 8 without changing application runtime behavior, tenant boundaries, hosted Supabase, provider configuration, customer data, or outbound automation.

## Acceptance criteria

- A scheduled and PR-triggered security monitor scans reachable Git history, repository workflow posture, and high-severity npm advisories.
- Existing GitHub Actions are pinned to immutable commit SHAs and checkout credentials are not persisted.
- Dependabot covers npm and GitHub Actions.
- Existing verification includes secret-history, repository-baseline, and high-severity dependency gates.
- Security reporting and incident-response guidance are documented.
- Existing Project 8 unit/build and disposable Supabase tenant/widget gates remain intact.

## Authorized implementation paths

- `.codex/CURRENT_TASK.md`
- `.github/dependabot.yml`
- `.github/workflows/**`
- `package.json`
- `scripts/security/**`
- `SECURITY.md`
- `docs/security/**`

## Authorized test paths

- `.github/workflows/**`
- `scripts/security/**`

## Explicit non-goals

- No application runtime changes.
- No Supabase schema, RLS, grants, hosted-environment, or customer-data changes.
- No model/provider, CRM, booking, email, SMS, voice, billing, or production configuration changes.
- No credential creation, rotation, revocation, or exposure.
- No merge to main or production deployment.

## Required gates

- Project 8 Agent Team v2 scope/risk validation.
- Reachable-history secret scan.
- Repository security baseline.
- High-severity dependency audit.
- Existing lint, typecheck, unit test, and production build verification.
- Existing disposable Project 8 database/widget verification.
- Exact-head reconciliation before review.
