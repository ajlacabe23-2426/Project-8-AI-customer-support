# Junk-removal pilot intake — review-only foundation

**Status:** A pure TypeScript training/pilot classification function and synthetic tests. **Not** integrated into the deployed website, public widget, hosted database, inbox, or outbound messaging. No business formation, insurance, licensing, or operating readiness is implied.

This is a prospective first vertical workflow for the Project 6 + 8 consolidation. Project 8 remains the proposed authenticated tenant-aware host; Project 6 remains the reference scoring and action-center behavior until parity and release acceptance are complete. This code is an *optional new intake precheck*, not an independent pricing or booking engine.

## Fictional example

~~~json
{"zipCode":"61701","jobType":"multiple_items","loadSize":"medium","access":"ground_floor","categories":["furniture"],"possibleRestrictedMaterials":false,"communicationConsent":false,"optedOut":false}
~~~

`assessJunkRemovalIntake` returns `ready_for_human_estimate` for a complete standard example, **not** service acceptance or a dollar estimate. It does not decide whether a particular address is within the company's final service area.

## Field guide and safety boundaries

- Request only a ZIP code, general job type, rough load size, access arrangement, and item category for the initial triage. Gather exact address or customer details later through an authenticated, privacy-reviewed workflow when genuinely necessary.
- Require explicit disclosure of potentially restricted materials; ambiguous answers are marked missing. Appliances, electronics, construction materials, and stairs are routed for extra human planning or disposal review.
- Never promise availability, costs, permitted disposal, pickup time, licensing, or insurance coverage. The 50/50 business agreements and any legal operating status are separate from software behavior.
- An inquiry does not imply communication consent. The output allows follow-up only when affirmative `communicationConsent === true` and no opt-out; this **does not** itself authorize a send. Channel-specific, auditable consent and owner-approved templates remain required at the actual messaging boundary.
- The function deliberately does not store names, messages, phone numbers, addresses or photos. Its output contains only status and reason codes. Before real intake persistence, derive workspace identity from the authenticated session and verify tenant isolation, retention, deletion and consent.
- A business operator must approve all job feasibility, disposal routes, estimates, scheduling and outbound messages.

## Release and integration gates (not passed by this branch)

1. Port all accepted data fields to a bounded API schema, enforce ownership and rate limits, and test anonymous/tenant negative cases.
2. Add human disposition in the Project 8 owner inbox without changing the existing public widget unexpectedly.
3. Verify a fictional end-to-end request from website -> case creation -> owner review -> estimate drafted only -> human approval, with duplicate retry protection.
4. Verify storage retention, privacy disclosures and deletion; no auto-outreach before consent and provider acceptance.
5. Get local hauler permit, insurance, disposal and business-formation requirements confirmed independently before paid operations.

This branch's acceptance is limited to local pure-function checks and later CI; no integration or deployment has been performed.
