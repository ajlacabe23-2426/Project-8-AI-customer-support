-- Project 8 retention-policy foundation.
-- This migration only stores an owner-configured retention window.
-- It does NOT schedule, trigger, or execute conversation deletion.
alter table public.workspaces
  add column conversation_retention_days integer not null default 30
  check (conversation_retention_days between 1 and 365);

comment on column public.workspaces.conversation_retention_days is
  'Owner-configured conversation retention target in days. Preview-only until a separately reviewed deletion workflow exists.';
