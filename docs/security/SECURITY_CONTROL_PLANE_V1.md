# Project 8 Security Control Plane v1

Updated: 2026-10-01

This control plane ports the reusable defensive repository baseline proven in Axiovela while preserving Project 8's distinct tenant, visitor-session, widget, and Supabase boundaries.

Automated controls include reachable-history credential-pattern scanning with values suppressed, immutable GitHub Action pinning, explicit read-only workflow token permissions, checkout credential removal, tracked secret-like file rejection, Dependabot coverage, high-severity npm advisory auditing, and existing application/database verification.

The repository layer does not replace hosted Supabase logs/advisors/backups, network-edge abuse controls, provider account security, customer identity verification, or production incident response. Those remain separate operational gates.
