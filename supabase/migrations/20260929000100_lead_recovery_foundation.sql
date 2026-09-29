-- Lead-recovery foundation for Project 8's automation-as-a-service direction.
-- Leads are derived server-side from explicit visitor intent/contact signals.
-- This migration is for a separate Project 8 development database only.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  conversation_id uuid not null unique references public.conversations(id) on delete cascade,
  status text not null default 'new'
    check (status in ('new','qualified','contacted','won','lost')),
  score integer not null default 0 check (score between 0 and 100),
  intent text not null check (intent in ('booking','pricing','purchase','service')),
  summary text not null check (length(summary) between 1 and 600),
  contact_email text check (contact_email is null or length(contact_email) <= 254),
  contact_phone text check (contact_phone is null or length(contact_phone) <= 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_workspace_status_idx
  on public.leads(workspace_id,status,created_at desc);

alter table public.leads enable row level security;

create policy "owners view leads" on public.leads for select to authenticated
  using (exists(
    select 1 from public.workspaces w
    where w.id=workspace_id and w.owner_id=(select auth.uid())
  ));

create policy "owners update lead status" on public.leads for update to authenticated
  using (exists(
    select 1 from public.workspaces w
    where w.id=workspace_id and w.owner_id=(select auth.uid())
  ))
  with check (exists(
    select 1 from public.workspaces w
    where w.id=workspace_id and w.owner_id=(select auth.uid())
  ));

grant select on public.leads to authenticated;
grant update(status,updated_at) on public.leads to authenticated;
grant select,insert,update,delete on public.leads to service_role;
