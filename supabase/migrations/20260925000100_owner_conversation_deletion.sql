-- Development candidate only. Apply after the base Project 8 migration.
-- Owners can delete their own visitor conversations (messages cascade).
-- No visitor/anonymous or cross-workspace DELETE permission is granted.
grant delete on public.conversations to authenticated;
create policy "owners delete conversations" on public.conversations
for delete to authenticated
using (exists (
  select 1 from public.workspaces w
  where w.id = workspace_id and w.owner_id = (select auth.uid())
));
