-- 多市場本地化：圖表匯率改存「折合本籍幣」、Invoice 付款方式擴充、公司／客戶登記欄

alter table public.ledgers rename column fx_rates_to_hkd to fx_rates_to_anchor;

comment on column public.ledgers.fx_rates_to_anchor is
  'Optional overrides: 1 unit foreign currency = N domestic. Domestic follows app host (HKD/SGD/TWD).';

alter table public.invoices drop constraint if exists invoices_payment_method_check;

alter table public.invoices
  add constraint invoices_payment_method_check check (
    payment_method in (
      'fps',
      'bank_transfer',
      'paypal',
      'paynow',
      'bank_fast',
      'cheque',
      'linepay',
      'jkopay'
    )
  );

alter table public.invoices
  add column if not exists company_reg_no text,
  add column if not exists client_tax_id text;

alter table public.user_invoice_prefs
  add column if not exists default_company_reg_no text,
  add column if not exists default_client_tax_id text;
