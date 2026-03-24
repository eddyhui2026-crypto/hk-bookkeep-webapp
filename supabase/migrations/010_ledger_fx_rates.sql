-- 每本生意簿：自訂「1 單位外幣 = 幾多 HKD」覆寫（jsonb）；缺省鍵則用程式內建預設匯率
alter table public.ledgers
  add column if not exists fx_rates_to_hkd jsonb not null default '{}'::jsonb;

comment on column public.ledgers.fx_rates_to_hkd is
  'Optional per-currency overrides: e.g. {"USD":7.8,"JPY":0.052}. HKD implied 1. Charts merge multi-currency to HKD.';
