Task ID: P8-P6-CONSOLIDATION-PARITY-2026-11-10
Title: Project 6 into Project 8 deterministic lead domain compatibility slice
Status: VERIFYING
Risk Tier: TIER_1
Base SHA: 821693e3e6f8132eb8950935a91a13fb9e793cc2

## Objective
Establish Project 8 as canonical Customer Operations Platform and port Project 6 qualification and lifecycle pure functions with source-equivalent test fixtures, without altering Project 8 runtime flows or customer environments.

## Acceptance criteria
- Existing Project 8 lib/leads.ts remains untouched, and no lead in the existing widget is reclassified by the new pure module.
- Project 6 score breakdown, route, priority, next action and lifecycle state transitions are independently reviewable in TypeScript.
- Verify source fixtures, missing fields, opt-out, invalid input, blocked transitions and idempotent no-op.
- Write an ADR naming identity, consent, storage and score-contract mismatches and the staged migration path.
- Required CI, TypeScript, unit, security and task-contract checks pass on the exact candidate SHA.
- No claim of hosted deploy, migration, merged production behavior or buyer readiness.

## Authorized implementation paths
- `.codex/CURRENT_TASK.md`
- `lib/leadflow-core.ts`
- `docs/ADR-001-LEADFLOW-CONSOLIDATION.md`

## Authorized test paths
- `lib/leadflow-core.test.ts`

## Explicit non-goals
No changing existing widget classification, admin APIs, auth, RLS, Supabase schema, hosted environment, Axiovela data, billing, provider calls, messages, customer data or merging to main. No uncontrolled automatic qualification of anonymous visitors.

## Required gates
Agent task contract, npm run check (lint, typecheck, tests, build), security monitor, Windows audit, optional disposable database no-regression suite. Independent Python parity and exact-head maintainer review required before merge.
