Task ID: P8-WINDOWS-AUDIT-CLI-20261020
Title: Remediate Windows dependency-audit launcher without waiving advisories
Status: IMPLEMENTING
Risk Tier: TIER_2
Base: main (separate security branch)

## Objective
Close issue #20: direct spawning of npm.cmd fails with EINVAL on Lenovo Windows.
Use process.execPath to invoke a verified npm-cli.js file directly with an
argument array (shell: false); reject missing CLI, subprocess errors, unexpected
status, empty/non-JSON/incomplete npm audit output.

## Authorized implementation paths
- .codex/CURRENT_TASK.md
- scripts/security/audit-dependencies.mjs
- scripts/security/audit-dependencies.test.mjs
- .github/workflows/verify.yml

## Required evidence
- Cross-platform, shell-free launcher behavior with Windows and POSIX path forms.
- Node built-in regression suite on both Ubuntu and Windows runners.
- Fail-closed malformed/incomplete/nonzero diagnostic results.
- Preserve production audit block, high/critical denial, exact advisory
  allowlist and original October 18 expiry; NO extension of expired exception.
- Exact-head Agent Team v2 / Verify / Security Monitor. Existing unpatched
  development tooling advisory may leave security gates red; report as BLOCKED,
  never turn RED into PASS or bypass those gates.
- Owner reruns npm.cmd run security:dependencies on Lenovo and records exit code.

## Hard stops
No merges to main, production deployment, hosted Supabase, email to customers,
secret changes, paid services, or edits to other project repositories.
