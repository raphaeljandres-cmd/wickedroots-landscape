-- Create this schema in a dedicated Supabase project for the private operations app.
-- The frontend uses Supabase Auth and user-scoped RLS; never expose service-role keys.
create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) <= 100),
  email text,
  phone text,
  source text,
  context text,
  status text not null default 'New' check (status in ('New','Contacted','Follow-up','Estimate','Won','Closed')),
  follow_up date,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.email_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  lead_name text not null,
  recipient text not null,
  subject text not null check (char_length(subject) <= 180),
  body text not null check (char_length(body) <= 5000),
  status text not null default 'pending_approval' check (status in ('pending_approval','sending','sent','rejected','approved_failed')),
  review_notes jsonb not null default '{}'::jsonb,
  approved_at timestamptz,
  sent_at timestamptz,
  provider_id text,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  agent_name text not null,
  status text not null check (status in ('completed','failed','needs_attention')),
  summary text not null,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists leads_user_created_idx on public.leads(user_id, created_at desc);
create index if not exists drafts_user_status_idx on public.email_drafts(user_id, status, created_at desc);
create index if not exists agent_runs_user_created_idx on public.agent_runs(user_id, created_at desc);

alter table public.leads enable row level security;
alter table public.email_drafts enable row level security;
alter table public.agent_runs enable row level security;

drop policy if exists "Users manage their own leads" on public.leads;
create policy "Users manage their own leads" on public.leads for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users manage their own drafts" on public.email_drafts;
create policy "Users manage their own drafts" on public.email_drafts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users read and create their own agent activity" on public.agent_runs;
create policy "Users read and create their own agent activity" on public.agent_runs for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
