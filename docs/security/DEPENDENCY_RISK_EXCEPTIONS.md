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
