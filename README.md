# Project 8 · AI Customer Support

Early-stage multi-tenant customer support software: a business-managed knowledge library, website chat widget, grounded AI answers, and human handoff/inbox. The homepage chat preview is illustrative, not an actual conversation.

## What works in this development candidate

- Next.js 15 / React 19 / TypeScript website and owner console.
- Supabase Auth email magic-link sign-in and workspace ownership.
- Workspace-owned articles, site-origin allowlists, widget configuration, inbox and human replies.
- Website widget at /widget.js: anonymous session token, live messages and human reply polling.
- AI answers grounded in retrieved business articles; questions without known answers route to the owner inbox. Without a model API key, the fallback always routes to human support.
- Database row-level security and application-level per-minute rate-limit counters.

**This is not a finished or production-ready SaaS.** No billing, team membership/invitations, automated data retention/deletion, verified customer identity, edge-level abuse prevention, privacy/legal review, enterprise support SLAs or independent security audit. Do not enter sensitive customer details into an unauthenticated visitor chat. AI responses are probabilistic and require human review for consequential matters. Widget domain allowlisting is a browser restriction, not cryptographic user authentication.

## Setup

Prerequisites: Node.js 22 and a **separate Project 8 development** Supabase instance (never the Axiovela database).

1. Run 'npm install'; generate and commit a reviewed package-lock.json before any release.
2. Copy '.env.example' to '.env.local' and configure the Project 8 Supabase URL, publishable anon key and server-only service role key.
3. Review and apply 'supabase/migrations/20260923000100_project8.sql' only to the new disposable/development instance. This creates tables, RLS policies and a rate limit procedure.
4. In Supabase Auth configuration, allow 'http://localhost:3000/auth/callback' as a redirect URL.
5. Optionally configure 'OPENAI_API_KEY' on the server. Without it the app routes questions to people instead of generating answers. Never place the secret in NEXT_PUBLIC_ variables.
6. Run 'npm run dev', sign in at 'http://localhost:3000/login', create a business workspace, allow 'http://localhost:3000' as a local widget origin and add a verified knowledge article.
7. Copy the widget snippet from Settings to an approved website. If deploying the app, set NEXT_PUBLIC_APP_URL to the actual application origin before sharing snippets.

## Verification

Run 'npm run check' (lint, TypeScript, unit tests and production build). Check all GitHub Actions results. Perform a manual two-owner/two-workspace SQL/RLS isolation exercise and a same-site/cross-site widget test against a **disposable** Supabase before even a private customer trial. The CI bootstrap currently installs dependencies without a committed lockfile; pin the dependency tree before shipping.

## Security boundaries

The admin API uses a Supabase Auth session and RLS-bound user database client. The service role key is server-side only. Widget endpoints require exact Origin matching and application rate-limiting; Origin can be forged by nonbrowser clients. The public widget key is not a secret. The visitor UUID is a temporary conversation-history capability, **not** a verified identity. Never return private account, order, or personal data over this anonymous channel.

A paid launch also needs scoped employee invitations, stronger network-level abuse controls, verified customer identity for account-specific requests, operational retention/deletion controls, audit logging, billing controls and privacy/security review.

## Development workflow

Candidate work stays on feature branches. Do not merge into main or provision a hosted database/paid model provider until test evidence and environment changes are reviewed.
