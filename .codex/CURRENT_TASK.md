Task ID: P8-ANONYMOUS-WIDGET-STREAM-BOUNDS-20261016
Title: Enforce streamed byte limits before parsing anonymous widget requests
Status: VERIFYING
Risk Tier: TIER_2
Base SHA: a7c29505ec87ffc3f5d972818c2a0c592fe92a63

## Objective
Close security follow-up #19 by bounding actual bytes consumed from anonymous chat
and history POST bodies, even for missing or dishonest Content-Length headers.
Replace unbounded request.text() usage without changing the successful JSON flow.

## Authorized implementation paths
- `app/api/chat/route.ts`
- `app/api/history/route.ts`
- `lib/bounded-body.ts`
- `.codex/CURRENT_TASK.md`

## Authorized test paths
- `lib/bounded-body.test.ts`

## Acceptance criteria
- Chat enforces 5000 wire bytes and history enforces 256 wire bytes before materialization.
- Content-Length preflight may reject early but is never trusted as a read limit.
- Oversized bodies fail with 413; invalid body stream or UTF-8 fails closed with 400.
- Valid JSON, CORS, origin checks, widget keys, rate limiting and tenant lookup semantics remain unchanged.
- Regression tests cover chunk boundaries, exact limit, dishonest/missing length, UTF-8,
  stream errors, and bodyless requests.
- CI, Security Monitor, Agent Team v2 contract, and disposable widget/database gates
  pass against one frozen candidate commit.

## Explicit non-goals
- Do not alter authentication callback PRs #24/#25, session identities, workspace RLS,
  database migrations, hosted Supabase, provider credentials, mail, billing, or production.
- No main merge or production deployment. Prior owner-endpoint no-store task on main
  remains independently tracked; this branch only changes its own active task contract.

## Required gates
- Agent Team v2 contract and changed-file scope.
- Verify Project 8: lint, types, unit tests, build, dependency and secret checks.
- Security monitor: baseline, history and dependency gates.
- Disposable Project 8 database and widget verification.
- Owner manual acceptance of hostile-length requests as needed before release.
