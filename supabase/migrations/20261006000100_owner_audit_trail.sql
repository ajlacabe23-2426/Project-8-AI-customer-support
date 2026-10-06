-- Project 8 owner audit evidence foundation.
-- Stores bounded administrative evidence only; never message bodies, contact details,
-- visitor capabilities, prompts, secrets, or deleted conversation content.
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('retention_policy_updated','conversation_deleted')),
  subject_id uuid,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details)='object'),
  created_at timestamptz not null default now()
);

create index audit_events_workspace_created_idx
  on public.audit_events(workspace_id,created_at desc);

alter table public.audit_events enable row level security;

create policy "owners view audit events" on public.audit_events
for select to authenticated
using (exists (
  select 1 from public.workspaces w
  where w.id=workspace_id and w.owner_id=(select auth.uid())
));

grant select on public.audit_events to authenticated;
grant select on public.audit_events to service_role;
revoke insert,update,delete on public.audit_events from anon,authenticated;

create or replace function public.record_retention_policy_audit()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.conversation_retention_days is distinct from old.conversation_retention_days then
    insert into public.audit_events(
      workspace_id,actor_user_id,event_type,subject_id,details
    ) values (
      new.id,
      auth.uid(),
      'retention_policy_updated',
      new.id,
      jsonb_build_object(
        'previousRetentionDays',old.conversation_retention_days,
        'retentionDays',new.conversation_retention_days
      )
    );
  end if;
  return new;
end;
$$;

create trigger audit_workspace_retention_update
after update of conversation_retention_days on public.workspaces
for each row execute function public.record_retention_policy_audit();

create or replace function public.record_conversation_delete_audit()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  insert into public.audit_events(
    workspace_id,actor_user_id,event_type,subject_id,details
  ) values (
    old.workspace_id,
    auth.uid(),
    'conversation_deleted',
    old.id,
    jsonb_build_object('conversationId',old.id)
  );
  return old;
end;
$$;

create trigger audit_conversation_delete
before delete on public.conversations
for each row execute function public.record_conversation_delete_audit();

revoke all on function public.record_retention_policy_audit() from public,anon,authenticated;
revoke all on function public.record_conversation_delete_audit() from public,anon,authenticated;

comment on table public.audit_events is
  'Owner-visible bounded audit evidence for sensitive Project 8 admin actions. No message bodies, contact details, visitor tokens, prompts, or secrets.';
