# Project 8 Incident Response

Updated: 2026-10-01

## Priorities

1. Protect customer and tenant data.
2. Stop active credential or account abuse.
3. Preserve evidence without publishing secrets.
4. Restore a known-good state.
5. Verify tenant isolation and customer-facing behavior before reopening affected functionality.

## Credential exposure

- Do not print or paste the suspected value into issues, chat, CI logs, or commits.
- Identify the provider/account and the smallest affected scope.
- Revoke or rotate through the provider's official control plane only with explicit authorization.
- Invalidate dependent sessions or deployments when the provider requires it.
- Scan reachable Git history and CI artifacts for related exposure.
- Verify the old credential no longer works before closing the incident.

## Suspicious repository or workflow change

- Freeze promotion of the affected candidate.
- Compare the suspect commit with the last verified candidate.
- Review workflow permissions, remote Action SHAs, checkout credential handling, package-lock changes, and generated artifacts.
- Re-run the secret-history scan, repository baseline, dependency audit, Project 8 verify workflow, and disposable database/widget gate.
- Rebuild from a known-good commit rather than trusting an unexplained artifact.

## Dependency or supply-chain advisory

- Confirm the affected package and version range from an authoritative advisory.
- Determine whether the vulnerable code path is reachable in Project 8.
- Prefer the smallest compatible patched update.
- Re-run lint, typecheck, unit tests, production build, tenant-isolation/database tests, and security gates.
- Keep observed facts separate from unverified exploit claims.

## Tenant-boundary or data incident

- Treat cross-workspace read/write access as a release blocker.
- Preserve the failing request/account/workspace identifiers without copying customer content unnecessarily.
- Re-run two-owner RLS and widget/session-capability tests after remediation.
- Do not restore outbound automation or account-specific actions until identity and authorization boundaries are verified.

## Recovery evidence

Record the affected commit, corrected commit, exact verification runs, remaining limitations, and any hosted actions that still require owner approval.
