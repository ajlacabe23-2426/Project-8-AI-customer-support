# LeadFlow persistence acceptance — Project 8

Status: **development-only candidate**, 2026-11-10.
Companion architectural branch: [Project 6 domain parity PR #52](https://github.com/ajlacabe23-2426/Project-8-AI-customer-support/pull/52).
This schema PR is independent of PR #52: it starts from current Project 8 main and requires separate review.

## What is implemented

- Migration `20261110112500_lead_case_workflow.sql` creates `lead_cases` and `lead_case_events`.
- Existing Project 8 `leads.status` and `leads.score` remain **visitor-intent** indicators. Newly created internal cases start `unreviewed` and `received`. No historic opportunity values, service details or consent are invented.
- Matching workspace and lead/comversation identities are enforced using composite foreign keys.
- A bounded internal state model and transition trigger follows Project 6's ten-state policy; immutable case identity and revision counter are enforced.
- An owner may **read**, but cannot insert/update/delete, case or event evidence. Anonymous access is denied. Trusted service-role code is the only intended writer.
- Consent defaults to false; an affirmative flag must include a source and time, and cannot coexist with opt-out. Source metadata is **recorded evidence, not independent proof** of valid legal consent.
- A bounded event table stores only event key/type, state reference and reason code, without messages, contact fields or visitor tokens. Event key collisions are rejected per workspace. Events are write-once for normal service/owner grants.
- Deletion of a conversation cascades through leads to cases and event rows, preserving current customer deletion behavior.

## Independent acceptance tests

`tests/integration/project8.integration.mjs` exercises a **fresh local disposable** Supabase stack and verifies:

1. Existing chat lead still uses its original intent score, while the internal case starts unreviewed.
2. A and B workspace owners read only their own internal case and event rows.
3. Owner and anonymous clients cannot forge internal records; only trusted service role can insert.
4. Service role cannot pair an A conversation with B lead, nor an A lead with B case/event.
5. Invalid state transitions and terminal-state reversal are rejected, even from the service role.
6. Consent with no timestamp/source and contradictory opt-out are rejected.
7. Duplicate workspace event keys reject at the database uniqueness boundary.
8. Removing the parent conversation cascades case and event rows.
9. Existing widget, login, CORS and browser acceptance remain green.

The existing GitHub Actions workflow starts a disposable loopback stack and runs the migration reset, browser checks and tests. CI results are accepted only for the current exact head SHA.

## Remaining before enabling the workflow

- **Server action/API:** Derive the owner workspace from an authenticated session. Never accept a client workspace ID alone as authorization.
- **Atomic idempotent transitions:** One transaction must lock the case, check expected revision/state, append an event and update state together. A unique event key alone is not an end-to-end exactly-once guarantee.
- **Source permission and consent:** Validate the communication channel and opt-in at use time; never infer permission from voluntary contact fields.
- **Outbox:** Add server-side durable queue, concurrency/claiming, bounded retries, dead-letter handling, cancellation and reconciliation, all using sandbox providers initially.
- **Data privacy:** Confirm retention/deletion impact, support procedures and incident logging before any customer import.
- **Hosted release:** Review data migration against a sanitized *copy* of real schema history, inspect existing inconsistent workspace references read-only, rehearse backup/restore, run two-owner and attacker negative checks, verify exact release commit and obtain separate owner authorization. Never run this migration in Axiovela.

## Explicit stop conditions

No hosted database writes, secrets, real customer data, real customer messages, auto outreach, billing, customer onboarding or production deploy in this change. If migration reset or isolation tests fail, keep the branch unmerged and production unchanged.

## Rollback

This change only adds a unique constraint, composite relationship, two tables, policies and a trigger to the intended Project 8 schema. For a **disposable** local database use a fresh reset. Do not automatically roll back a hosted database using DROP statements: once a workflow writes data, any destructive rollback would lose those records. Host rollout and rollback need a separately approved, rehearsed forward/backup plan.
