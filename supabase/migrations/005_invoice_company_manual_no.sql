-- 發票：抬頭公司名；Invoice 編號改由用戶自填（仍係每用戶內唯一）
-- 並移除舊 RPC（改由 app 直接 insert）

alter table public.invoices
  add column if not exists company_name text;

drop function if exists public.create_invoice_with_number(
  date,
  text,
  text,
  numeric,
  text,
  text,
  text
);
