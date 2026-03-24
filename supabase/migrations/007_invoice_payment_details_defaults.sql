-- Invoice：收款詳情（FPS／銀行等）；用戶預設欄位（新增時預填）

alter table public.invoices
  add column if not exists payment_details text;

alter table public.user_invoice_prefs
  add column if not exists default_company_name text,
  add column if not exists default_client_name text,
  add column if not exists default_invoice_number text,
  add column if not exists default_currency text,
  add column if not exists default_payment_method text,
  add column if not exists default_payment_details text,
  add column if not exists default_description text,
  add column if not exists default_notes text;
