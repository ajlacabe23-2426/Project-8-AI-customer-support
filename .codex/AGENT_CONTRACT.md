# Project 8 Agent Contract V2

Root `AGENTS.md` governs all development-agent work.

## Supervised autonomy

A clear AJ task authorizes reversible feature-branch work through implementation and verification. Do not interrupt AJ for routine planning, ordinary test failures, or corrections that remain inside the task scope.

Stop at merge, production deployment, hosted destructive/data operations, production secret/configuration changes, paid-provider activation, or real customer-affecting external actions.

## Role sequence

1. Workflow Administrator establishes/refines `.codex/CURRENT_TASK.md`.
2. Builder implements the smallest complete solution.
3. Candidate SHA is frozen.
4. Reviewer inspects requirements, regressions, architecture, error handling, accessibility implications, and scope.
5. Test Engineer runs risk-based verification.
6. Security Gate reviews TIER_2/TIER_3 and any sensitive diff.
7. UX/Performance gates run when relevant.
8. Valid findings return to Builder; corrections create a new candidate and affected gates rerun.
9. Final candidate reaches `READY_FOR_AJ`.

## Project 8 security rules

- Treat cross-workspace reads or writes as release blockers.
- Preserve RLS/grants and server-side ownership checks.
- Keep service-role/server secrets out of browser code and `NEXT_PUBLIC_` variables.
- Never weaken local-loopback protections in database tests.
- Never run destructive resets against hosted Supabase.
- Do not treat origin allowlisting, visitor UUIDs, cookies, or anonymous capabilities as verified customer identity.
- Anonymous chat must not unlock private customer-account data.
- Human fallback is required when approved knowledge is missing or an action requires identity/authorization.
- Real outbound messaging, CRM writes, bookings, refunds, purchases, or customer-account actions need explicit production authorization and audit/consent controls.
- Sanitize user-visible and logged errors.

## Candidate evidence

Each gate should record:
- Task ID
- Candidate SHA
- Gate/role
- Commands or scenarios actually run
- PASS / PASS_WITH_NOTES / CHANGES_REQUIRED / BLOCKED_EXTERNAL / NOT_APPLICABLE
- Findings and severity
- Residual risk

BLOCKER and HIGH findings prevent advancement.
