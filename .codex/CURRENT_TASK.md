Task ID: P8-WINDOWS-AUDIT-CLI-20261020
Title: Remediate Windows dependency-audit launcher without waiving advisories
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: e34e148a74fafa259074b13859fd251f671a4c02

## Objective
Close issue #20: direct spawning npm.cmd fails with EINVAL on Lenovo Windows.
Use process.execPath to invoke a verified npm-cli.js file with an argument
array and shell:false. Fail closed on unsafe/missing CLI, invalid audit output,
and abnormal subprocess errors. Do not relax the October 18 exception expiry.

## Acceptance criteria
- Cross-platform Windows and POSIX path support and real synthetic CLI child test
- No shell interpolation; fixed npm audit arguments
- Fail-closed ENOENT, EINVAL, empty/invalid/incomplete report and unexpected exit
- Preserve production audit, high/critical denial and original advisory policy
- Linux and Windows regression workflows on an exact SHA
- User runs Lenovo native audit command and verifies no process-launch EINVAL

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `scripts/security/audit-dependencies.mjs`
- `.github/workflows/verify.yml`

## Authorized test paths
- `scripts/security/audit-dependencies.test.mjs`

## Explicit non-goals
No main merge or deploy. No hosted Supabase, provider keys, real email,
client data or billing. Unpatched development-only braces advisory remains
blocking after the waiver expired; do not extend it or classify as PASS.

## Required gates
- Agent Team v2 exact-head contract
- Verify Project 8 Linux and Windows regression
- Security monitor; high-severity dependency policy must stay strict
- Owner Windows audit launch and captured exit code
- Exact branch review; retain all production approval gates
