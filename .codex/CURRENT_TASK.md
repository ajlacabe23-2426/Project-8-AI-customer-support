Task ID: P8-AGENTS-V2-001
Title: Adopt Agent Team v2 control plane
Status: VERIFYING
Risk Tier: TIER_0
Base SHA: 43e41b4bf3eea2e675a087a29cdff55512a0d1ee

## Objective

Install a Project 8-specific supervised-autonomy control plane on top of the exact green MVP candidate so future work can use bounded Builder/Reviewer/Test/Security roles without changing runtime product behavior.

## Acceptance criteria

- Root agent instructions define Project 8 authority and hard stops.
- A concise agent contract defines role sequence, candidate integrity, and Project 8 tenant/customer-data boundaries.
- The active-task contract is machine-validated for required fields, allowed paths, and minimum risk tier.
- Offline validator regression tests pass.
- GitHub Actions runs the agent contract checks on feature/chore pushes and pull requests.
- No runtime code, database migration, provider configuration, outbound messaging, or production behavior changes.

## Authorized implementation paths

- `AGENTS.md`
- `.codex/**`
- `.github/scripts/validate_task_contract.py`
- `.github/scripts/test_agent_team_v2.py`
- `.github/workflows/agent-team-v2.yml`

## Authorized test paths

- `.github/scripts/validate_task_contract.py`
- `.github/scripts/test_agent_team_v2.py`
- `.github/workflows/agent-team-v2.yml`

## Explicit non-goals

- No application/runtime changes.
- No Supabase schema, RLS, grant, or hosted-environment changes.
- No model/provider integration changes.
- No CRM, booking, email, SMS, voice, billing, refund, purchase, or account-action automation.
- No merge to main or production deployment.

## Required gates

- Scope/risk validator
- Offline validator regression tests
- Reviewer
- Test Engineer
- Existing Project 8 verification workflows on the final branch head
