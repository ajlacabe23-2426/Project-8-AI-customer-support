Task ID: P8-SECURITY-CONTROL-PLANE-V1
Title: Reconcile Project 8 security control plane after main integration
Status: CORRECTIONS_REQUIRED
Risk Tier: TIER_1
Base SHA: 84033ae491eafd22f0ada0915d0dbefe48bffa5b

## Objective

Reconcile the verified Project 8 repository security control plane against the current main candidate after squash integration. Restore task-contract validity, preserve the existing runtime and tenant boundaries, and resolve or explicitly track newly surfaced dependency advisories without weakening the production security boundary.

## Acceptance criteria

- The active task contract is anchored to the current main SHA and passes the Agent Team v2 validator for this correction branch.
- Scheduled and PR-triggered security monitoring continues to scan reachable Git history, repository workflow posture, and high-severity npm advisories.
- Existing GitHub Actions remain pinned to immutable commit SHAs and checkout credentials are not persisted.
- Dependabot coverage for npm and GitHub Actions remains active.
- Existing verify, build, secret-history, repository-baseline, disposable Supabase, tenant-isolation, widget and CORS checks remain intact.
- The current high-severity `braces` advisory is not hidden or mislabeled. Because no patched npm release is currently available and the installed path is development-only, any temporary handling must remain explicit, narrowly scoped, documented, and reversible.
- No application runtime behavior, tenant boundary, hosted Supabase state, provider configuration, customer data, or outbound automation changes are introduced by this correction task.

## Authorized implementation paths

- `.codex/CURRENT_TASK.md`
- `.codex/AGENT_CONTRACT.md`
- `.github/dependabot.yml`
- `.github/scripts/validate_task_contract.py`
- `.github/scripts/test_agent_team_v2.py`
- `.github/workflows/**`
- `AGENTS.md`
- `package.json`
- `package-lock.json`
- `scripts/security/**`
- `SECURITY.md`
- `docs/security/**`

## Authorized test paths

- `.github/scripts/test_agent_team_v2.py`
- `.github/workflows/**`
- `scripts/security/**`

## Explicit non-goals

- No application runtime changes.
- No Supabase schema, RLS, grants, hosted-environment, or customer-data changes.
- No model/provider, CRM, booking, email, SMS, voice, billing, or production configuration changes.
- No credential creation, rotation, revocation, or exposure.
- No weakening of tenant isolation or widget-origin protections.
- No suppression of unrelated dependency advisories.

## Required gates

- Project 8 Agent Team v2 scope/risk validation.
- Reachable-history secret scan.
- Repository security baseline.
- High-severity production dependency gate plus explicit review of development-only advisories.
- Existing lint, typecheck, unit test, and production build verification.
- Existing disposable Project 8 database/widget verification.
- Exact-head reconciliation before merge.
