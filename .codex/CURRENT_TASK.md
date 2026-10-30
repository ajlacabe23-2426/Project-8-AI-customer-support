Task ID: P8-ISOLATED-DEV-AUTH-MIGRATION-RECOVERY-2026-10-30
Title: Repair isolated Project 8 dev migration and email-to-workspace login flow
Status: VERIFYING
Risk Tier: TIER_3
Base SHA: e3bee37a8f290649a343c4d5136a075ec2757d90

## Objective
Unblock the verified isolated Project 8 development database migration and fix the operator login UI's misleading generic error. The new dev project uses pgcrypto under extensions rather than public, and the Safari email login request initially failed (recorded 401). After correcting the public key, the hosted OTP request and mail.send event succeeded but first-time verification had not occurred. Support server-side email token-hash links alongside existing PKCE code exchange. Do not expose credentials, modify production deployment, or claim email delivery is verified without a successful test.

## Acceptance criteria
- The visitor capability hash migration uses the Supabase extension-qualified digest function; preserve SHA-256 behavior and unique constraints.
- Six schema migrations are recorded against the new isolated Project 8 development project. Do not reset any hosted DB.
- Sign-in UI separates absent local settings, invalid API key, blocked recipient, rate limit, and network failure, never reflecting raw exceptions or secrets.
- Auth feedback regression tests cover each category.
- The Next.js confirmation callback accepts both PKCE codes and only email/magiclink token-hash types; success sets secure response cookies and redirects internally to /dashboard. Invalid or ambiguous input fails closed without reflecting errors.
- Verify frozen candidate SHA with lint, TypeScript, Vitest, build, repository security, contract scope, and disposable integration workflows.
- Real email delivery and browser authentication remain manual device checks, not assumed complete from code or schema status.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `supabase/migrations/20260928000100_hash_visitor_capabilities.sql`
- `app/login/page.tsx`
- `app/auth/callback/route.ts`
- `lib/auth-feedback.ts`

## Authorized test paths
- `lib/auth-feedback.test.ts`
- `app/auth/callback/route.test.ts`
- `tests/acceptance/magic-link.browser.cjs`

## Explicit non-goals
No migrations to Axiovela; no production database changes or data deletion; no production credential creation/rotation; no GitHub main merge without AJ review; no outbound customer messaging, billing, external provider enablement, email delivery claims, hosted release sign-off, or privacy/compliance assertions. Preserve separate Project 8 dev project and credentials.

## Required gates
Security review of the migration and auth boundaries, candidate-exact lint/typecheck/test/build, branch and task policy validation, isolated Supabase schema and RLS checks, reviewed manual browser magic-link login at localhost:3000 with correctly scoped credentials, two-owner RLS isolation, widget/human inbox acceptance, owner-approved merge and release decisions.
