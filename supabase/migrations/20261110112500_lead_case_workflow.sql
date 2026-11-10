-- Additive Project 6 -> Project 8 internal lead-case model.
-- Apply ONLY to a freshly reset disposable Project 8 database for this review.
-- NO hosted migration, billing, customer outreach or API activation.
-- Existing public.leads.status/score remain visitor-intent fields, NOT qualification.
--
-- Scope existing lead identity to its conversation workspace. A mismatch in
-- existing records is a hard validation failure, never silently corrected.
alter table public.conversations
  add constraint conversations_id_workspace_unique unique (id, workspace_id);
alter table public.leads
  add constraint leads_id_workspace_unique unique (id, workspace_id);
alter table public.leads
  add constraint leads_conversation_workspace_consistent
  foreign key (conversation_id, workspace_id)
  references public.conversations(id, workspace_id) on delete cascade;

create table public.lead_cases (
  lead_id uuid primary key,
  workspace_id uuid not null,
  lifecycle_state text not null default 'received'
    check (lifecycle_state in (
      'received', 'awaiting-information', 'ready-for-review', 'qualified',
      'nurture', 'awaiting-owner-action', 'ready-to-schedule', 'scheduled',
      'closed', 'suppressed'
    )),
  qualification_status text not null default 'unreviewed'
    check (qualification_status in ('unreviewed', 'needs-info', 'qualified', 'nurture')),
  qualification_score integer
    check (qualification_score is null or qualification_score between 0 and 100),
  reviewed_service text
    check (reviewed_service is null or length(reviewed_service) between 2 and 160),
  estimated_value numeric(14,2)
    check (estimated_value is null or estimated_value >= 0),
  timeline_days integer
    check (timeline_days is null or timeline_days between 1 and 3650),
  budget_confirmed boolean not null default false,
  decision_maker boolean not null default false,
  communication_consent boolean not null default false,
  consent_source text
    check (consent_source is null or length(consent_source) between 2 and 120),
  consent_observed_at timestamptz,
  opted_out boolean not null default false,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, lead_id),
  constraint lead_case_matching_workspace
    foreign key (lead_id, workspace_id)
    references public.leads(id, workspace_id) on delete cascade,
  constraint lead_case_consent_consistent check (
    not (communication_consent and opted_out) and
    (not communication_consent or
      (consent_source is not null and consent_observed_at is not null))
  ),
  constraint lead_case_qualification_evidence check (
    qualification_status <> 'qualified' or
    (qualification_score is not null and qualification_score >= 70 and reviewed_service is not null
      and estimated_value is not null and timeline_days is not null)
  ),
  constraint lead_case_state_requires_review check (
    lifecycle_state <> 'qualified' or qualification_status = 'qualified'
  ),
  constraint lead_case_optout_suppressed check (
    not opted_out or lifecycle_state = 'suppressed'
  )
);

create index lead_cases_workspace_state_idx
  on public.lead_cases(workspace_id, lifecycle_state, updated_at desc);

-- A state change must respect the original Project 6 finite-state machine.
-- A same-state update is allowed for independently reviewed facts.
create function public.guard_lead_case_update()
returns trigger language plpgsql set search_path = '' as $$
declare allowed text[];
begin
  if new.workspace_id is distinct from old.workspace_id
    or new.lead_id is distinct from old.lead_id then
    raise exception 'Lead case identity is immutable' using errcode = '23514';
  end if;

  if new.lifecycle_state is distinct from old.lifecycle_state then
    allowed := case old.lifecycle_state
      when 'received' then array['awaiting-information','qualified','nurture','suppressed']
      when 'awaiting-information' then array['ready-for-review','closed','suppressed']
      when 'ready-for-review' then array['qualified','nurture','closed','suppressed']
      when 'qualified' then array['awaiting-owner-action','ready-to-schedule','closed','suppressed']
      when 'nurture' then array['ready-for-review','closed','suppressed']
      when 'awaiting-owner-action' then array['ready-to-schedule','closed','suppressed']
      when 'ready-to-schedule' then array['scheduled','closed','suppressed']
      when 'scheduled' then array['closed']
      else array[]::text[]
    end;
    if not (new.lifecycle_state = any(allowed)) then
      raise exception 'Invalid lead lifecycle transition' using errcode = '23514';
    end if;
  end if;

  new.version := old.version + 1;
  new.updated_at := now();
  return new;
end
$$;

create trigger enforce_lead_case_update
  before update on public.lead_cases
  for each row execute function public.guard_lead_case_update();

revoke all on function public.guard_lead_case_update()
  from public, anon, authenticated;

-- A bounded, PII-free event trail. Unique workspace event keys make repeated
-- ingestion observable as a conflict instead of duplicating a lifecycle event.
-- Atomic event + state transitions require a later authorized server workflow.
create table public.lead_case_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  lead_id uuid not null,
  event_key text not null check (
    length(event_key) between 1 and 128 and event_key ~ '^[A-Za-z0-9._:-]+
  event_type text not null
    check (event_type in ('created','qualification_reviewed','transition','consent_updated')),
  from_state text check (from_state is null or from_state in (
    'received','awaiting-information','ready-for-review','qualified','nurture',
    'awaiting-owner-action','ready-to-schedule','scheduled','closed','suppressed'
  )),
  to_state text not null check (to_state in (
    'received','awaiting-information','ready-for-review','qualified','nurture',
    'awaiting-owner-action','ready-to-schedule','scheduled','closed','suppressed'
  )),
  reason_code text not null check (
    length(reason_code) between 1 and 120 and reason_code ~ '^[A-Za-z0-9._:-]+$'
  ),
  created_at timestamptz not null default now(),
  constraint lead_case_events_matching_case foreign key (workspace_id, lead_id)
    references public.lead_cases(workspace_id, lead_id) on delete cascade
);

-- Event keys are unique within each workspace; event IDs are generated
-- server-side. Do not include tokens, email, phone or customer messages in keys.
create index lead_case_events_workspace_created_idx
  on public.lead_case_events(workspace_id, created_at desc);

alter table public.lead_cases enable row level security;
alter table public.lead_case_events enable row level security;

create policy "owners view lead cases" on public.lead_cases
for select to authenticated
using (exists (
  select 1 from public.workspaces w
  where w.id = lead_cases.workspace_id and w.owner_id = (select auth.uid())
));

create policy "owners view lead case events" on public.lead_case_events
for select to authenticated
using (exists (
  select 1 from public.workspaces w
  where w.id = lead_case_events.workspace_id and w.owner_id = (select auth.uid())
));

-- Client owners can see their own records, but cannot author qualification,
-- consent, status transitions or event history. Only trusted server code can.
revoke all on public.lead_cases, public.lead_case_events
  from public, anon, authenticated;
grant select on public.lead_cases, public.lead_case_events to authenticated;
grant select, insert, update on public.lead_cases to service_role;
grant select, insert on public.lead_case_events to service_role;

comment on table public.lead_cases is
  'Internal LeadFlow qualification and state only; no implicit consent and no anonymous writer.';
comment on table public.lead_case_events is
  'Server-only immutable event evidence: do not store raw visitor messages or contact data.';

  ),
  unique (workspace_id, event_key),
  event_type text not null
    check (event_type in ('created','qualification_reviewed','transition','consent_updated')),
  from_state text,
  to_state text not null,
  reason_code text not null check (
    length(reason_code) between 1 and 120 and reason_code ~ '^[A-Za-z0-9._:-]+$'
  ),
  created_at timestamptz not null default now(),
  constraint lead_case_events_matching_case foreign key (workspace_id, lead_id)
    references public.lead_cases(workspace_id, lead_id) on delete cascade
);

-- Event keys are unique within each workspace; event IDs are generated
-- server-side. Do not include tokens, email, phone or customer messages in keys.
create index lead_case_events_workspace_created_idx
  on public.lead_case_events(workspace_id, created_at desc);

alter table public.lead_cases enable row level security;
alter table public.lead_case_events enable row level security;

create policy "owners view lead cases" on public.lead_cases
for select to authenticated
using (exists (
  select 1 from public.workspaces w
  where w.id = lead_cases.workspace_id and w.owner_id = (select auth.uid())
));

create policy "owners view lead case events" on public.lead_case_events
for select to authenticated
using (exists (
  select 1 from public.workspaces w
  where w.id = lead_case_events.workspace_id and w.owner_id = (select auth.uid())
));

-- Client owners can see their own records, but cannot author qualification,
-- consent, status transitions or event history. Only trusted server code can.
revoke all on public.lead_cases, public.lead_case_events
  from public, anon, authenticated;
grant select on public.lead_cases, public.lead_case_events to authenticated;
grant select, insert, update on public.lead_cases to service_role;
grant select, insert on public.lead_case_events to service_role;

comment on table public.lead_cases is
  'Internal LeadFlow qualification and state only; no implicit consent and no anonymous writer.';
comment on table public.lead_case_events is
  'Server-only immutable event evidence: do not store raw visitor messages or contact data.';
