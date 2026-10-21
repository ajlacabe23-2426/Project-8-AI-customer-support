# Project 8 — Existing Business Installation and Next-Step Runbook

**Date:** 2026-10-21  
**Scope:** Owner-supervised **development/demo**, not public production launch.  
**Security note:** `main` is blocked by dependency/security checks until the separately reviewed security candidate PR #34 completes release acceptance. This runbook does not bypass any check.

## What should happen after signup

1. Business owner receives a Supabase magic link and follows it to the authenticated owner console.
2. Owner creates their business workspace (or chooses one already owned), enters their approved website origin and confirms exact tenant isolation.
3. Owner adds **verified** business knowledge (hours, shipping, cancellations, refunds, products, escalation policy); do not paste sensitive customer/order data.
4. Owner opens **Settings**, copies the `/widget.js` install snippet, and places it in the approved business website. This installs a *separate* customer chat widget; creating a workspace by itself does **not** automatically alter an existing website.
5. Visitors ask questions via the embedded widget. The server searches the workspace's approved knowledge. Without server-side `OPENAI_API_KEY`, unknown answers are routed to human support rather than invented.
6. Explicit booking, pricing, purchase and service questions can surface as **lead candidates** in the Leads queue, where an owner can manually mark qualification/contact/outcome. This system does **not** email or SMS customers, schedule appointments, sync CRMs, or charge customers on its own.
7. The owner can review unresolved chats in the human Inbox, reply through supported widget polling, and review incoming lead signals. Treat any request involving personal orders/account identity as requiring a separate verified secure channel.

## For an established business

- Confirm the business's actual website origin, current privacy/retention policy, the approved knowledge owner and the proper staff escalation process.
- Start with synthetic conversations in an isolated testing environment, **not** real customers.
- Add the established FAQ, return/exchange policy and service parameters as short individual approved articles; verify version, authority and last-review date.
- Test an answer that is present in knowledge and one that is absent. Unanswered questions should escalate cleanly without fabrication.
- Test pricing/booking intent **without** entering actual customer contact data. Check the lead explanation and ensure no outbound action occurs.
- Test the widget allowed-origin boundary with both expected and disallowed origins; nonbrowser clients can forge Origin, so origin allowlisting is not customer authentication.
- Have an owner review a human handoff in Inbox, then re-authenticate and confirm records persist and an unrelated workspace cannot access them.
- Keep all hosted Supabase secrets and service keys out of source control and the browser; use a **Project 8-specific**, separately provisioned environment.

## What it is and isn't

| Implemented development behavior | Not yet implemented / separately gated |
| --- | --- |
| Magic-link owner authentication and workspace knowledge | Self-service paid onboarding and billing |
| Website widget, retrieved-knowledge responses, human fallback | Guaranteed AI accuracy or regulated advice |
| Intent-based lead queue and manual status tracking | Auto-CRM, scheduling, SMS/email campaigns |
| Workspace data isolation enforcement + security regression tests | Independent penetration test and third-party security certification |
| Owner-initiated conversation deletion + bounded audit event | Automated retention deletion and finalized backup/privacy programs |

## Lenovo acceptance (defer until owner has access)

- [ ] Confirm the tested release's commit SHA, CI and Security Monitor all pass **on that exact SHA**.
- [ ] Run Project 8 against its own disposable Supabase stack and Mailpit; re-test real magic-link redirect/session cookies.
- [ ] Complete two **distinct** synthetic owner/workspace logins, check cross-tenant data isolation.
- [ ] Install widget on one approved test origin; reject a different origin.
- [ ] Verify approved-knowledge answer, unknown-answer fallback, lead intent, manual inbox reply and refresh persistence.
- [ ] Check retention/delete workflow, error messaging and negative paths; ensure no unexpected outbound execution.
- [ ] Produce a written owner **GO/NO-GO** for a small controlled pilot before any production rollout.

## Release blocks as of October 21

- Main Security Monitor and application verification are failing.
- Draft [PR #34](https://github.com/ajlacabe23-2426/Project-8-AI-customer-support/pull/34) passes the five remote checks at `3785d558b53fc70a3c0f1fa644735f95a47ced3c`, but stays **unmerged** and requires integrated review/owner acceptance.
- No production deploy, hosting changes, customer onboarding, secret insertion or paid services are authorized by this document.

This document is an operator explanation and runbook, not evidence that a customer's site has been installed.
