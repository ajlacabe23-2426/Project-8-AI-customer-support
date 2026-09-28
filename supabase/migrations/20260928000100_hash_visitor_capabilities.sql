-- Hash browser-held anonymous visitor capabilities before persistence.
-- The browser continues to present the random UUID; the server compares only SHA-256 digests.
alter table public.conversations
  add column visitor_token_hash text;

update public.conversations
set visitor_token_hash=encode(digest(visitor_token::text,'sha256'),'hex');

alter table public.conversations
  alter column visitor_token_hash set not null,
  add constraint conversations_visitor_token_hash_format
    check (visitor_token_hash ~ '^[0-9a-f]{64}$');

alter table public.conversations
  drop constraint if exists conversations_workspace_id_visitor_token_key;

alter table public.conversations
  drop column visitor_token;

alter table public.conversations
  add constraint conversations_workspace_visitor_hash_key
    unique (workspace_id,visitor_token_hash);
