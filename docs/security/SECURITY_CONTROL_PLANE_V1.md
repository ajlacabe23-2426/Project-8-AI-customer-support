# Project 8 Security Control Plane v1

Updated: 2026-10-04

This control plane ports the reusable defensive repository baseline proven in Axiovela while preserving Project 8's distinct tenant, visitor-session, widget, and Supabase boundaries.

Automated controls include reachable-history credential-pattern scanning with values suppressed, immutable GitHub Action pinning, explicit read-only workflow token permissions, checkout credential removal, tracked secret-like file rejection, Dependabot coverage, blocking high-severity **production** dependency auditing, full dependency-advisory reporting, and existing application/database verification.

## Development-tooling advisory handling

On 2026-10-03 the scheduled monitor began failing because npm classified `braces` <= 3.0.3 under GHSA-vfj7-8cjw-p6xm as high severity. The installed copy is transitive and marked development-only in the lockfile. As of 2026-10-04 the advisory publishes no patched npm version.

Project 8 therefore keeps production high-severity advisories as a blocking gate while the full dependency audit remains visible as a non-blocking reporting step. This is a narrow, reversible handling of an unpatched development-tooling advisory; it is not permission to suppress unrelated advisories. Once an upstream patched dependency path is available, the full high-severity audit should return to blocking.

The current Vitest development dependency also reports GHSA-82fw-gwwq-j7x9 at moderate severity. It remains visible in the reporting audit and should be upgraded to a maintained patched Vitest line in a separately verified dependency change.

The repository layer does not replace hosted Supabase logs/advisors/backups, network-edge abuse controls, provider account security, customer identity verification, or production incident response. Those remain separate operational gates.
