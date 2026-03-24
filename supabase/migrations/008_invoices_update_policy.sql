-- 允許用戶更新自己嘅 invoices（編輯 Invoice）

drop policy if exists "invoices_update_own" on public.invoices;

create policy "invoices_update_own"
  on public.invoices for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
