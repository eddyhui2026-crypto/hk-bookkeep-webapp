-- 簡易 Invoice：每用戶遞增編號 + 發票紀錄（列印用）

alter table public.profiles
  add column if not exists invoice_counter int not null default 0;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  invoice_number text not null,
  invoice_date date not null,
  client_name text not null,
  description text not null default '',
  amount numeric(18, 4) not null check (amount >= 0),
  currency text not null check (currency in ('HKD', 'USD')),
  payment_method text not null check (payment_method in ('fps', 'bank_transfer', 'paypal')),
  notes text,
  created_at timestamptz not null default now()
);

create unique index if not exists invoices_user_number_uq
  on public.invoices (user_id, invoice_number);

create index if not exists invoices_user_created_idx
  on public.invoices (user_id, created_at desc);

alter table public.invoices enable row level security;

create policy "invoices_select_own"
  on public.invoices for select
  using (auth.uid() = user_id);

create policy "invoices_insert_own"
  on public.invoices for insert
  with check (auth.uid() = user_id);

create policy "invoices_delete_own"
  on public.invoices for delete
  using (auth.uid() = user_id);
