-- Invoice 幣種與 transactions／快速記一筆一致（CURRENCIES）

alter table public.invoices
  drop constraint if exists invoices_currency_check;

alter table public.invoices
  add constraint invoices_currency_check
  check (
    currency in ('HKD', 'CNY', 'USD', 'EUR', 'GBP', 'JPY', 'SGD', 'MOP')
  );
