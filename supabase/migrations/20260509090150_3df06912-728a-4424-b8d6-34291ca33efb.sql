
-- inboxes: device-token-owned containers
create table public.inboxes (
  id uuid primary key default gen_random_uuid(),
  owner_token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- feedback_links: short-code public links
create table public.feedback_links (
  id text primary key,
  inbox_id uuid not null references public.inboxes(id) on delete cascade,
  label text,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);
create index feedback_links_inbox_idx on public.feedback_links(inbox_id);

-- feedbacks: only sanitized text persisted
create table public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  link_id text not null references public.feedback_links(id) on delete cascade,
  sanitized_text text not null,
  status text not null default 'new',
  reply_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);
create index feedbacks_link_idx on public.feedbacks(link_id);
create index feedbacks_reply_token_idx on public.feedbacks(reply_token);

-- replies from inbox owner
create table public.replies (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedbacks(id) on delete cascade,
  reply_text text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);
create index replies_feedback_idx on public.replies(feedback_id);

-- Enable RLS, no client-direct policies (all access via server fn with service role)
alter table public.inboxes enable row level security;
alter table public.feedback_links enable row level security;
alter table public.feedbacks enable row level security;
alter table public.replies enable row level security;

-- Cleanup function (called by pg_cron daily)
create or replace function public.candor_cleanup_expired()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.feedbacks where expires_at < now();
  delete from public.replies where expires_at < now();
end;
$$;

-- Schedule daily cleanup at 03:00 UTC
create extension if not exists pg_cron;
select cron.schedule(
  'candor-cleanup-expired',
  '0 3 * * *',
  $$select public.candor_cleanup_expired();$$
);
