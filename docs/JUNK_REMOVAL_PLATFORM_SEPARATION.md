# Separation contract — LeadFlow CX platform vs. junk-removal business

**Status:** Proposed architecture and **fictional-only** demonstration. No customer data has been integrated or exchanged; no owner, legal entity, IP rights, subscription terms or vendor relationship are established by this document.

## Distinct boundaries

| Area | Planned responsibility | Must remain separate |
| --- | --- | --- |
| **Project 8 (LeadFlow CX)** | The proposed reusable Next.js/Supabase SaaS, tenant-scoped sign-in, business knowledge, visitor support, owner inbox, lead-case persistence and internal actions | Platform code, credentials, other tenants and account data must not become a pooled junk-removal business asset by default |
| **Project 6 (LeadFlow V1)** | Independently runnable Python/SQLite scoring, action-center and workflow **reference**; pure junk-removal policy parity mirror | No second live production inbox, no unsynchronized writable customer source, no cross-project database access |
| **Junk-removal vertical** | Business-specific field/rule module, human-reviewed estimate intake, item and safety flags, and later consent-checked follow-up | Do not apply generic consulting lead-value scoring blindly; do not assume field completion equals job feasibility |
| **Junk-removal operating business** | Separately formed and governed 50/50 venture, physical operations, licenses, disposal partners, insurance, customer work and finances | No implicit transfer of platform intellectual property or other companies' customer records. Confirm the actual relationship in a separate written software license/service agreement |

The 50/50 owners should explicitly decide whether the technology platform is owned personally, by a software company, by the junk-removal company, or licensed to it. Do not infer ownership from who operates a demo or which account pays a bill. An Illinois attorney and accountant should review the resulting agreements and business-tax treatment.

## Actual candidate integration

- `lib/junk-removal-intake.ts`: input completion, potentially restricted materials and access review, explicit consent precheck.
- `lib/junk-removal-owner-task.ts`: side-effect-free internal task **draft**, reusing the conceptual Project 6 Action Center approach without actual persistence, customer communication, task assignment or scheduling.
- `app/preview/junk-removal/`: a noindex preview presenting four completely fictional inquiries and their proposed human tasks. It is not a customer form, an application for a haul, a hosted pilot, or proof of business operating readiness.
- In Project 6, `app/verticals/junk_removal.py` is a separate implementation of the v1 precheck for independent policy comparison. The two repositories must be tested at frozen commit hashes for parity.

## Future runtime integration gate

1. Verify Project 6 and Project 8 policy parity on exact frozen commits. Reconcile and close the active repository task contract **before** changing production code ownership. Do not bypass a failing task-scope gate.
2. Add a server-only tenant-authenticated integration: owner/workspace derived from session and authorized in database RLS; no trust in a submitted workspace ID.
3. Validate and size-limit all inputs, secure visitor capabilities, enforce rate limits and deduplicate repeat submissions.
4. Introduce a versioned lead-case event in one Project 8 tenant only. No writes to Project 6's SQLite reference or another tenant. Avoid duplicate Action Center state.
5. Add human review: confirm estimate and service eligibility, disposal restrictions, site access, crew/vehicle constraints, service-area permits, and the customer's final authorization.
6. Require verifiable, channel-specific opt-in before any outbound communication. The booleans in the preview are not a substitute for consent evidence or permission to send.
7. Rehearse backups/restores, access controls and negative cross-tenant tests in disposable environments before hosted migration.
8. Confirm privacy, customer terms, DPA/license, insurance, municipal hauling permits and business structure separately before accepting real jobs or publishing operational claims.

## Current release verdict

**NO-GO for live junk-removal customers, quoting, booking and outbound messaging.** A preview, an independent Python scoring reference and a passing isolated database/widget CI run do not establish a secure combined production product. The existing high-severity dependency exception expiration and unrelated active task-contract failure must be reconciled; never paper over those failures by disabling controls.
