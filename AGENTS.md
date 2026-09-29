# Project 8 Agent Instructions

## Operating model

Project 8 uses supervised autonomy.

AJ defines the objective and remains the final product/release authority. Development agents should carry a clear task through planning, implementation, correction, review, testing, and security verification without stopping for routine approvals.

The default is: finish reversible branch work, verify one frozen candidate SHA, then present the completed candidate to AJ.

## Autonomous authority

For a clear task, agents may inspect the repository, plan, edit scoped files, add tests, implement sensitive code on a feature branch, run validation, correct findings, commit, push, and open/update pull requests.

Agents must stop before:
- merging to `main`;
- production deployment or promotion;
- hosted production database changes;
- destructive hosted-data operations;
- creating, rotating, exposing, or revoking production secrets;
- enabling paid services or billing;
- sending real customer email/SMS/voice messages;
- executing refunds, purchases, account deletion, or other customer-affecting actions;
- force-pushing or rewriting shared history.

## Product trust boundaries

Project 8 is a multi-tenant AI front desk and lead-recovery product.

Preserve these rules:
- Workspace ownership and tenant isolation are release-critical.
- Browser-origin allowlisting is not authentication.
- Anonymous visitor capabilities are session/browser capabilities, not verified customer identity.
- Do not expose private account, billing, order, medical, financial, or other sensitive customer data through anonymous chat.
- Do not invent business policies, prices, guarantees, delivery commitments, appointment availability, or refund decisions.
- When knowledge is missing, uncertain, policy-dependent, or action-dependent, fail safely to human review.
- Contact details may be retained only when voluntarily supplied and only within the approved workspace boundary.
- Lead scoring must remain transparent and explainable; do not present opaque purchase-propensity predictions as fact.
- Outbound messaging or CRM actions require explicit consent/identity rules, provider configuration, abuse controls, auditability, and task-specific approval before production use.

## Task control plane

`.codex/CURRENT_TASK.md` is the only active task contract. It must contain:
- Task ID
- Title
- Objective
- Status
- Risk Tier
- Base SHA
- Authorized implementation paths
- Authorized test paths
- Acceptance criteria
- Explicit non-goals
- Required gates

Allowed states:
`NO_ACTIVE_TASK -> ACTIVE -> IMPLEMENTING -> VERIFYING -> CORRECTIONS_REQUIRED -> IMPLEMENTING -> VERIFYING -> READY_FOR_AJ -> COMPLETE`.

Only AJ closes a task as `COMPLETE`.

## Risk tiers

- TIER_0: administrative/docs/non-runtime workflow changes.
- TIER_1: ordinary UI/application behavior.
- TIER_2: auth, APIs, provider boundaries, persistence, identity, ownership.
- TIER_3: RLS, grants, migrations, destructive-data pathways, production environment contracts.

The actual diff may only maintain or increase the declared risk.

## Required roles

Use only the roles needed by the task:
- Project 8 Builder
- Reviewer
- Test Engineer
- Security Gate for TIER_2/TIER_3 or sensitive diffs
- UX Inspector when UI changes
- Performance review when performance-relevant
- Read-only Research Specialist when source-grounded product/technical research is required

Reviewer and Security Gate stay independent and read-only against a frozen candidate. Findings go back to Builder; a correction creates a new candidate SHA and invalidates affected evidence.

## Candidate integrity

All required gates must refer to the same candidate SHA. Never combine passing evidence from different revisions into a single PASS claim.

## Validation baseline

Where applicable:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- disposable loopback-only Supabase verification
- widget/origin/session-capability checks
- negative cross-owner/tenant tests
- `git diff --check`
- task-scope validation

Do not claim a check passed unless it actually ran.

## Final AJ package

When a task reaches `READY_FOR_AJ`, report:
1. objective/result;
2. frozen candidate SHA;
3. changed files;
4. review/test/security results;
5. CI/integration results;
6. tenant/auth/data impact;
7. resolved findings;
8. residual risk/unverified behavior;
9. smallest manual acceptance checklist;
10. exact hard-stop action awaiting AJ.
