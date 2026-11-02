# Project 8 — business onboarding and service-gate candidate

This PR provides **owner-authenticated, server-derived readiness evidence**, not a verified production onboarding or paid entitlement system. It does not create billing, trial expiration, workspace suspension, or a claim that an anonymous visitor is authenticated.

## Owner journey
1. Sign in with an actual Supabase owner session.
2. Create a workspace and enter an exact approved website origin.
3. Add owner-verified policy/FAQ articles.
4. Open the dashboard's **Setup readiness** checklist, computed from owner RLS-bound database reads.
5. Copy the widget snippet, install it on a permitted test site, and independently verify one answer + one unknown-question handoff on the actual deployment.
6. Record observed browser outcomes, exact SHA, and go/no-go. Step 5 remains **unverified** in the product until a controlled acceptance check is completed; the API never pretends to detect installation.

## Security
- `GET /api/admin/onboarding?workspaceId=...` requires an authenticated session, checks a visible workspace under RLS and reads only its knowledge count.
- Unknown or cross-tenant workspace IDs return not found, not another owner's counts.
- No message bodies or contact information in onboarding response; private responses are no-store.
- No user-entered "I'm production ready" field can override security checks.
- Demo only with synthetic/test content until hosted access/privacy gates are verified.

## Not yet implemented
- Durable **plan entitlements and quotas** (should be transactionally enforced in Postgres after designing a migration/upgrade path; avoid client-side counts for billing).
- Trial expiration/suspension state, metered billing, payments, webhooks, dunning and receipts.
- Real widget installation proof, provider-independent health checks, rate controls at edge, two-owner hosted acceptance.
- Legitimate shared employee roles, deletion automation, backups/recovery, service SLAs.

The work deliberately avoids changing any existing Supabase schema or applying migrations to a customer environment. Do not use these checklist results as evidence that a paid service can launch.
