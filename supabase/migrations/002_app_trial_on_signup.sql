-- 新用戶：自動 14 日 app 內試用（trialing + trial_ends_at），唔經 Stripe 先開到寫入權限
-- 已部署庫請喺 SQL Editor 執行本檔一次

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

-- 仍為 none 且未綁 Stripe 客戶嘅帳戶：補上試用（解決舊 trigger 只 insert id 導致無法記帳）
update public.profiles
set
  subscription_status = 'trialing',
  trial_ends_at = timezone('utc', now()) + interval '14 days',
  updated_at = now()
where subscription_status = 'none'
  and (stripe_customer_id is null or btrim(stripe_customer_id) = '');
