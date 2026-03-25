-- 新增 TWD（新台幣），與應用程式 CURRENCIES 一致

alter table public.invoices
  drop constraint if exists invoices_currency_check;

alter table public.invoices
  add constraint invoices_currency_check
  check (
    currency in (
      'HKD',
      'CNY',
      'USD',
      'EUR',
      'GBP',
      'JPY',
      'SGD',
      'MOP',
      'TWD'
    )
  );
