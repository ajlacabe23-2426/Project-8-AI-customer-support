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

## Patched Vitest tooling — 2026-10-12

GHSA-82fw-gwwq-j7x9 is remediated by pinning Vitest and its matching mocker to 4.1.11 (official patched version: https://github.com/advisories/GHSA-82fw-gwwq-j7x9). The test-tool major upgrade is isolated from the unchanged Next.js app and validated with all 22 tests, lint, types and build. The npm-generated lockfile preserves runtime dependency versions and integrity. Two moderate findings are removed; this does not remove the five development-chain high findings above or extend their October 18 expiry. No public browser-mode test server is introduced.
