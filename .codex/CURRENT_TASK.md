Task ID: P8-EXISTING-BUSINESS-RUNBOOK-20261021
Title: Provide an accurate existing-business onboarding and acceptance runbook
Status: VERIFYING
Risk Tier: TIER_0
Base SHA: e34e148a74fafa259074b13859fd251f671a4c02

## Objective
Document observed Project 8 behavior following magic-link signup, the website widget installation workflow, the business knowledge and manual lead lifecycle, product limitations, and an exact-SHA Lenovo acceptance plan. Keep source code, CI/security policies, hosted environments and data unchanged.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `docs/EXISTING_BUSINESS_ONBOARDING_2026-10-21.md`

## Authorized test paths
- `.codex/CURRENT_TASK.md`

## Acceptance criteria
- No runtime, dependency, workflow, database or hosted service changes.
- Cite or accurately restate implemented behavior already described in README.
- Separate owner-reported local acceptance from unverified hosted/business-customer operation.
- Preserve the unreleased security integration branch as a separate task.
- Run the existing task-contract check for exactly this branch; do not reinterpret upstream application/security check failures as caused by this documentation change.

## Explicit non-goals
- No source-code changes, patching of security advisories, production deployment, hosted Supabase settings, customer onboarding, automatic email/SMS, paid services, secrets, cross-project coupling, or merge to main.
- Do not declare Project 8 production-ready while main release gates fail and owner acceptance is unfinished.

## Required gates
- Task-contract/scope check at the updated branch head.
- Observe CI/Security Monitor status and report inherited main failures distinctly from this change.
- Human review and Lenovo/browser verification before release.
