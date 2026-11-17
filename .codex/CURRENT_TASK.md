Task ID: P8-ONBOARDING-HISTORY-20261117
Title: Archive original business onboarding workflow without stale readiness claims
Status: VERIFYING
Risk Tier: TIER_0
Base SHA: 6b17eafc479a44d163085e58430b2240b00e118f

## Objective
Preserve the original October 21 runbook in clearly historical form for operator training and future acceptance work.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `docs/EXISTING_BUSINESS_ONBOARDING_2026-10-21.md`

## Authorized test paths
- `tests/integration/project8.integration.mjs`

## Acceptance criteria
- Dated text explicitly identified as historical, not an active deployment or customer-readiness assertion.
- Do not modify application behavior, permissions, provider configuration or main release gates.
- Complete exact-head task contract, CI and security review.

## Explicit non-goals
No live customers, consent, hosted migrations, media publishing, billing, secrets, or approval of production releases.

## Required gates
Exact-head agent task and all relevant CI/security checks.
