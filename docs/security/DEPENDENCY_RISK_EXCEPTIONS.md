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
