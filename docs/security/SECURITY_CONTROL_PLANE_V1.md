# Project 8 Security Control Plane v1

Updated: 2026-10-04

This control plane ports the reusable defensive repository baseline proven in Axiovela while preserving Project 8's distinct tenant, visitor-session, widget, and Supabase boundaries.

Automated controls include reachable-history credential-pattern scanning with values suppressed, immutable GitHub Action pinning, explicit read-only workflow token permissions, checkout credential removal, tracked secret-like file rejection, Dependabot coverage, full high/critical npm advisory auditing with one narrow expiring dev-only exception, and existing application/database verification.

## Development-tooling advisory handling

On 2026-10-03 the scheduled monitor began failing because npm classified `braces` <= 3.0.3 under GHSA-vfj7-8cjw-p6xm as high severity. The installed copy is transitive and marked development-only in the lockfile. As of 2026-10-04 the advisory publishes no patched npm version.

Project 8 keeps the full high/critical dependency audit blocking. Only GHSA-VFJ7-8CJW-P6XM is temporarily excepted, only while every affected node remains dev-only and inside the documented Next/ESLint lint chain, and only until 2026-10-18. Any unrelated high/critical advisory, runtime exposure, chain expansion, or expiry fails the gate.

The current Vitest development dependency also reports GHSA-82fw-gwwq-j7x9 at moderate severity. It remains visible in the reporting audit and should be upgraded to a maintained patched Vitest line in a separately verified dependency change.

The repository layer does not replace hosted Supabase logs/advisors/backups, network-edge abuse controls, provider account security, customer identity verification, or production incident response. Those remain separate operational gates.
