# Temporary dependency-risk exceptions

## GHSA-VFJ7-8CJW-P6XM

- Created: 2026-10-04
- Expires: 2026-10-18T00:00:00Z
- Severity: high
- Direct affected package: `braces`
- Scope: development-only Next/ESLint tooling
- Runtime exposure: blocked by policy

Project 8 keeps the full package-lock high/critical audit blocking. The only temporary exception is GHSA-VFJ7-8CJW-P6XM when it resolves exclusively through the known development-only chain:

`eslint-config-next -> @next/eslint-plugin-next -> fast-glob -> micromatch -> braces`

Every affected lockfile node must remain marked `dev: true`. Any unrelated high/critical advisory, runtime exposure, chain expansion, or expiry fails the gate.

Moderate advisories remain visible through a separate reporting audit and are not silently hidden. The exception must be removed earlier if a patched upstream dependency path becomes available.

## 2026-10-19 reassessment (NO extension approved or applied)

The exception above expired as written on 2026-10-18. Scheduled Security Monitor runs
on October 18 and 19 correctly FAILED the dependency policy gate. Do not report a
passing security monitor based on older builds. As of this reassessment, GitHub
Advisory [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
still lists no patched npm release of `braces`; `npm ls` shows the exact chain above.

The October 19 production-only `npm audit --omit=dev --audit-level=low` reported
zero vulnerabilities. That test is narrower than the full-tree audit: the latter
had five high findings for the one development-only `braces` advisory and two
moderate findings for Vitest 3/mocker before the Vitest 4.1.11 remediation.

Do not extend the expiry automatically or imply zero full-tree vulnerabilities.
Before a release, choose and approve one of the following with fresh exact-head
CI evidence: a trusted upstream patched chain, removal of the dependency while
preserving equivalent lint coverage, or a tightly scoped timeboxed exception
backed by renewed dev-only/zero-runtime evidence and a dated follow-up.

## 2026-10-20 combined candidate (PR #32 Windows fix + PR #31 tooling)
The October 18 expiry remains unchanged; no release waiver is active or renewed.
The earlier five development-only findings were from the Next ESLint glob dependency
chain; the new candidate's lockfile has no entries for `eslint-config-next`,
`fast-glob`, `micromatch`, or `braces` (including nested installed copies).
Vitest 4.1.11 and Vite 8.3.4 are tracked in this candidate lockfile.

**Important tradeoff:** This mitigation replaces Next's standard ESLint plugin with
a smaller independent ESLint / TypeScript / React Hooks configuration. It therefore
does **not** preserve equivalent Next.js-specific lint-rule coverage by default.
Treat that lint-coverage change as an unresolved engineering review and release
gate; do not infer an equivalent security posture from a green npm audit alone.
Do not merge or promote the combined candidate until Next-specific lint-equivalence
and full application/regression testing are reviewed. In particular, do not bring
the temporary `security-lockfile-refresh.yml` workflow from PR #31 into this
candidate: it requested contents:write and persisted checkout credentials.

The findings above concern only the proposed draft candidate. The latest shipped
main branch remains separately subject to its own dependency audit and release gates.

## Next-specific lint coverage — security branch (2026-10-20)

The original `eslint-config-next/core-web-vitals` transitively pulled unpatched
`braces` through `@next/eslint-plugin-next → fast-glob → micromatch`.
Installing the official plugin directly does not remove that dependency; there
is **no approved renewal** of the temporary exception that expired October 18.

To retain useful Next.js/App Router lint checks without the advisory, this
candidate adds the reviewed, dependency-free `local-next` plugin with rules:

| Local rule | Protected pattern | Limits |
| --- | --- | --- |
| `no-raw-img` | JSX `<img>`; recommend `next/image` | Only JSX, not string templates/DOM APIs |
| `no-internal-html-link` | Static internal `<a href="/…">`; recommend `next/link` | Does not resolve dynamic expressions or detect all route files |
| `no-sync-script` | `<script src>` without `async`/`defer` | Does not inspect scripts created through DOM APIs |
| `no-raw-head` | Literal `<head>` in `app/` | Does not audit all Metadata API correctness |
| `no-next-document-in-app` | `next/document` imports from `app/` | Does not implement all Next import/path restrictions |
| `no-unsafe-blank-target` | JSX target=_blank without rel=noopener noreferrer | Additional conservative browser hygiene |

Each rule has failing/passing fixtures using the repository's actual ESLint
configuration, and the GitHub Verify workflow runs that suite independently.

**Residual gate:** This is targeted replacement coverage, **not complete
`@next/next` / core-web-vitals rule parity**. The Next build may still warn
that the official plugin was not detected; this is expected and must not be
silenced by naming the local plugin as the official plugin or bypassing lint.
The official config also includes React, JSX accessibility, and a wider set
of Next rules that have not been fully reinstated. Review these differences
before any main merge or production promotion. Reassess a vetted upstream
patched chain when one exists. All other production, RLS, and owner browser
security acceptance gates remain mandatory.
