# Project 8: Next.js ESLint coverage review (2026-10-25)

**Status: EXTENDED SCOPED COVERAGE, not equivalent to the official Next.js recommended/Core Web Vitals ESLint configuration. Production release remains HOLD pending independent acceptance.**

## Reason for independent lint stack

The earlier `eslint-config-next` development dependency chain introduced an unpatched high-severity `braces` advisory via `fast-glob` and `micromatch`. The combined patched candidate removed that chain instead of extending an expired exception. ESLint core, TypeScript and React Hooks checks remain enabled. The smaller local-next rules are independent App Router checks; they are NOT a complete drop-in replacement.

Official reference: https://nextjs.org/docs/app/api-reference/config/eslint (21 Next-plugin rules plus React and other checks).

## Scoped rules independently enforced and regression tested

| Local rule | Intended protection | Equivalence caveat |
| --- | --- | --- |
| `no-raw-img` | raw image tag | local JSX-only approximation |
| `no-internal-html-link` | literal internal anchors | does not resolve dynamic routes |
| `no-sync-script` | synchronous script src | JSX only |
| `no-raw-head` | raw head tag in `app/` | not all Pages router variants |
| `no-unsafe-blank-target` | rel policy on static target | local-specific hardening |
| `no-next-document-outside-document` | disallow `next/document` imports outside `pages/_document` | static ES imports only; aliases/require() not modeled |
| `no-css-link` | raw stylesheet link | literal rel only |
| `no-polyfillio-script` | known unsafe polyfill.io script src | static script URLs only; not all polyfill rules |
| `no-next-head-in-app` | next/head import in `app/` | local App Router rule, not a full Next-plugin replacement |

All are fail-closed ESLint errors **for the constructs in their documented scope**, not equivalent implementations of Next's official rules. Coverage also depends on configured application-file patterns.

## Known uncovered areas / review gates

- Full Next-specific 21-rule equivalence still unverified. Newly added local rules mitigate common inline-script-id, Client Component, Pages Router beforeInteractive, Next document/head, and styled-jsx mistakes. Font-display/preconnect, Google Analytics script placement, module assignment, custom font placement, data-fetching export-name typos, and dynamic/aliased imports remain uncovered or weaker.
- Core Web Vitals severity matching, official React JSX accessibility/React plugin coverage beyond the current React Hooks and TypeScript rules.
- App-specific dynamic JSX expressions, aliases and router/file conventions are not comprehensively modeled.
- Next.js build may warn about the missing official plugin. A green `npm audit` must never be interpreted as full lint parity.

## Evidence and release requirements

1. `node --test lint/next-core-guards.node-check.mjs`, `npm run lint`, `npm run check` and exact-head Linux/Windows GitHub Actions on the expanded rules (do not reuse earlier CI).
2. `npm audit --include=dev --audit-level=moderate` should remain clear; do not restore the affected dependency chain without a patched, audited upstream alternative.
3. Review remaining Next-specific lint gaps explicitly and retain this map. Do not mark full equivalence based on these tests. The extra rules are bounded, application-focused guards, not upstream implementations.
4. Keep merge/hosted changes behind owner approval, two-account browser acceptance and business readiness gates.

## Resolution scope

This update closes six additional *tested, static-source* Next.js lint coverage gaps without changing the `package-lock.json` or bringing back the unpatched `braces` development dependency. Remaining documented differences are deliberately visible, not silently waived. The branch is acceptable for protected integration **only** after exact-head security, build, Windows audit, task contract and disposable owner/browser checks are green; full lint parity and public rollout remain separate decisions.
