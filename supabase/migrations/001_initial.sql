-- Harbix HK Bookkeep — run in Supabase SQL Editor (or supabase db push)
-- Storage: create bucket "receipts" (private) if not exists via Dashboard or:
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Profiles (subscription fields updated only via service role / webhook)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text,
  subscription_status text not null default 'none',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Ledgers (max 10 enforced in application)
create table if not exists public.ledgers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists ledgers_user_id_idx on public.ledgers (user_id) where deleted_at is null;

alter table public.ledgers enable row level security;

create policy "ledgers_all_own"
  on public.ledgers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Categories per ledger
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ledger_id uuid not null references public.ledgers (id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists categories_ledger_id_idx on public.categories (ledger_id);

alter table public.categories enable row level security;

create policy "categories_all_own"
  on public.categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ledger_id uuid not null references public.ledgers (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(18, 4) not null check (amount >= 0),
  currency char(3) not null default 'HKD',
  note text,
  tx_date date not null default (current_date),
  receipt_path text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_ledger_date_idx on public.transactions (ledger_id, tx_date desc);

alter table public.transactions enable row level security;

create policy "transactions_all_own"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- New user → profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, subscription_status, trial_ends_at)
  values (
    new.id,
    'trialing',
    (timezone('utc', now()) + interval '14 days')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage policies for receipts (path: {user_id}/{...})
create policy "receipts_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "receipts_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "receipts_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "receipts_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
