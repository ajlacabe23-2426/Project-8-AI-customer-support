# Project 8 combined security integration — 2026-10-26

This file records the **non-production** integration test boundary of PR #37 after retargeting to main.

## Candidate composition
- Dependency remediation, including Vitest 4.1.12 and associated lockfile updates
- Shell-free, tested Windows npm-audit launcher
- Independent lint stack with focused Next App Router safeguards
- Regression tests for audit policy and local lint guards

## Required verification before merge
1. Exact HEAD must pass GitHub **Verify Project 8**, **Security monitor**, **Agent Team v2 contract**, and **Disposable Project 8 database and widget verification** workflows.
2. Confirm npm audit at high/critical blocking policy, and review any moderate findings.
3. Confirm lint/tests/types/build on both supported runners, including Windows audit regression.
4. Compare local Next lint rule coverage against the official recommended/Core Web Vitals rules. The focused guards have documented parity gaps; do not assert parity or full security completion.
5. Re-run authorized, isolated two-owner login, persistence, RLS, browser, knowledge and widget acceptance before public or customer-data use.

**Release status: HOLD.** This change does not authorize production deployment, hosted migrations, billing, customer data, or an assertion of complete parity.
