# Project 8 — operational controls candidate (October 29, 2026)

This branch adds **read-only owner usage counts** and a **visitor widget emergency pause**. It does not create billing, plan enforcement, a paid subscription, a trial expiry, or a validated hosted release.

## Owner usage dashboard
- `GET /api/admin/usage?workspaceId=<uuid>` requires a valid owner session.
- Confirm the workspace exists under the caller's RLS visibility before counting records.
- All-time exact counts: knowledge articles, conversations, pending human reviews, leads, and active leads. Unlike a limited first-page list, these totals do not silently truncate at 50/100.
- All counts use owner-scoped database queries with `Cache-Control: no-store`; missing/foreign workspace returns 404.
- No payment, AI token usage, email address, visitor session, or message-body data is returned. Counts are **not** a commercial billing meter.

## Emergency visitor pause
- When `P8_WIDGET_PAUSED=1` (or any non-false/nonempty value), all widget context lookups fail closed, denying OPTIONS and POST on public chat/history routes. Signed-in owner APIs remain available.
- To resume after authorization and testing, unset the variable or set `P8_WIDGET_PAUSED=false`. Restart/redeploy any relevant server instances and validate exact behavior.
- This is an application-level control, not a substitute for edge WAF or incident management.
- It is configured in the **server deployment environment only**. Never expose server secrets or add this to client variables.

## Customer and billing gates still missing
- Postgres-backed tenant plan entitlements and **atomic** usage quota enforcement, paid plan lifecycle and audited suspension/resumption.
- Hosted callback acceptance, two-owner privacy checks, realistic AI traffic and edge abuse coverage.
- Billing provider sandbox integration, webhook authenticity, payment reconciliation, invoices, refunds and explicit user approval.
- Real support operations, uptime alerts, data deletion execution, backup/restore validation, legal terms and private data review.

These changes do not authorize real customer data or production billing. Keep the existing synthetic demo isolated until the separate release gate passes.

## Restricted pilot roster — server-enforced
- Set `P8_PILOT_WORKSPACES=<workspace_uuid>,<workspace_uuid>` in the **server-only deployment configuration** to allow visitor widget requests for only specifically approved workspaces.
- If the variable is absent, existing local/demo behavior remains unchanged. If it is defined but empty, malformed, or missing an incoming workspace, public widget endpoints fail closed.
- The same guard applies to preflight, chat and history requests through their shared workspace context.
- Workspace creation and owner sign-in still work; **creating a workspace does not automatically grant pilot use** when the roster is configured.
- This is an operator-controlled allowlist for restricted testing, NOT durable trial status, payment entitlement, verified customer identity, usage quota, or a billing meter.
