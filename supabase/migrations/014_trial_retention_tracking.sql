-- 試用結束後 T+30 提醒電郵（見私隱政策 §6）；T+60／T+90 清除以刪除 Auth 用戶為準，毋須另欄
alter table public.profiles
  add column if not exists trial_retention_reminder_sent_at timestamptz;

comment on column public.profiles.trial_retention_reminder_sent_at is
  'T+30（以 trial_ends_at 為 T0）已發出資料保留／訂閱提醒電郵之時間';
