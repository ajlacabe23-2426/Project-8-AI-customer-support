-- Apply only to a NEW development Supabase project, not Axiovela's database.
create extension if not exists pgcrypto;
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  public_key uuid not null unique default gen_random_uuid(),
  allowed_origins text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index workspaces_owner_idx on public.workspaces(owner_id);
create table public.knowledge (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null check (length(title) between 2 and 100),
  body text not null check (length(body) between 10 and 4000),
  created_at timestamptz not null default now()
);
create index knowledge_workspace_idx on public.knowledge(workspace_id);
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  visitor_token uuid not null,
  status text not null default 'open' check (status in ('open','needs_human','closed')),
  created_at timestamptz not null default now(),
  unique (workspace_id,visitor_token)
);
create index conversations_workspace_idx on public.conversations(workspace_id,created_at desc);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','human')),
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages(conversation_id,created_at);
create table public.widget_rate_limits (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  key text not null,
  bucket timestamptz not null,
  count integer not null default 1,
  primary key(workspace_id,key,bucket)
);
alter table public.workspaces enable row level security;
alter table public.knowledge enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.widget_rate_limits enable row level security;
create policy "owners manage workspaces" on public.workspaces for all to authenticated
  using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));
create policy "owners manage knowledge" on public.knowledge for all to authenticated
  using (exists(select 1 from public.workspaces w where w.id=workspace_id and w.owner_id=(select auth.uid())))
  with check (exists(select 1 from public.workspaces w where w.id=workspace_id and w.owner_id=(select auth.uid())));
create policy "owners view conversations" on public.conversations for select to authenticated
  using (exists(select 1 from public.workspaces w where w.id=workspace_id and w.owner_id=(select auth.uid())));
create policy "owners update conversations" on public.conversations for update to authenticated
  using (exists(select 1 from public.workspaces w where w.id=workspace_id and w.owner_id=(select auth.uid())))
  with check (exists(select 1 from public.workspaces w where w.id=workspace_id and w.owner_id=(select auth.uid())));
create policy "owners view messages" on public.messages for select to authenticated
  using (exists(select 1 from public.conversations c join public.workspaces w on w.id=c.workspace_id
    where c.id=conversation_id and w.owner_id=(select auth.uid())));
create policy "owners reply to messages" on public.messages for insert to authenticated
  with check (role='human' and exists(select 1 from public.conversations c join public.workspaces w on w.id=c.workspace_id
    where c.id=conversation_id and w.owner_id=(select auth.uid())));
-- Grant only operations exercised by the owner console; RLS still enforces exact owner/workspace ownership.
-- Public visitor writes never use authenticated/anon table grants: they pass through bounded server-only widget routes.
grant select, insert, update, delete on public.workspaces, public.knowledge to authenticated;
grant select, update on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;
-- Server-only visitor endpoints need explicit table rights as well as their
-- service-role RLS bypass. Never expose this role/key in the browser.
grant select, insert, update, delete on public.workspaces, public.knowledge,
  public.conversations, public.messages to service_role;
revoke all on public.widget_rate_limits from anon,authenticated;
create or replace function public.claim_widget_rate_limit(p_workspace uuid,p_key text,p_bucket timestamptz,p_max integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_count integer;
begin
  if p_max<1 or p_max>100 or length(p_key)>128 or p_bucket <> date_trunc('minute',p_bucket)
  then return false; end if;
  insert into public.widget_rate_limits(workspace_id,key,bucket,count)
  values(p_workspace,p_key,p_bucket,1)
  on conflict(workspace_id,key,bucket) do update set count=public.widget_rate_limits.count+1
    where public.widget_rate_limits.count<p_max
  returning count into v_count;
  return v_count is not null;
end $$;
revoke all on function public.claim_widget_rate_limit(uuid,text,timestamptz,integer) from public,anon,authenticated;
grant execute on function public.claim_widget_rate_limit(uuid,text,timestamptz,integer) to service_role;
-- A scheduled maintenance job should remove rate limit rows older than a day.
