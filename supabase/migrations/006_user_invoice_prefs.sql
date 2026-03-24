-- Invoice 列印用聯絡方式（用戶自填 email／電話，唔寫入 profiles 以免 RLS 更新敏感欄）

create table if not exists public.user_invoice_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  contact_email text,
  contact_phone text,
  updated_at timestamptz not null default now()
);

alter table public.user_invoice_prefs enable row level security;

create policy "user_invoice_prefs_select_own"
  on public.user_invoice_prefs for select
  using (auth.uid() = user_id);

create policy "user_invoice_prefs_insert_own"
  on public.user_invoice_prefs for insert
  with check (auth.uid() = user_id);

create policy "user_invoice_prefs_update_own"
  on public.user_invoice_prefs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
