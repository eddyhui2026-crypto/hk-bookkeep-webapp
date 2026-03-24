# Harbix 香港記帳（hk-bookkeep-webapp）

Next.js 16 + Supabase（Auth／Postgres／Storage）+ Stripe Billing（英國戶口、HKD）+ Unosend（聯絡表單電郵）。

正式網域：**https://hkbookkeep.harbix.app**

## 本機開發

1. 複製環境變數：`cp .env.local.example .env.local`（Windows 可手動複製）並填入。
2. 在 Supabase SQL Editor 依次執行 [`001_initial.sql`](supabase/migrations/001_initial.sql)、[`002_app_trial_on_signup.sql`](supabase/migrations/002_app_trial_on_signup.sql)、[`003_invoices.sql`](supabase/migrations/003_invoices.sql)；若曾執行過 [`004_invoice_rpc.sql`](supabase/migrations/004_invoice_rpc.sql)，請再執行 [`005_invoice_company_manual_no.sql`](supabase/migrations/005_invoice_company_manual_no.sql)（加 `company_name`、移除舊 RPC）。新部署可略過 004，直接 003 後接 005。Invoice 列印聯絡方式需再執行 [`006_user_invoice_prefs.sql`](supabase/migrations/006_user_invoice_prefs.sql)；收款詳情欄與「Invoice 預設」預填需執行 [`007_invoice_payment_details_defaults.sql`](supabase/migrations/007_invoice_payment_details_defaults.sql)；發票列表「編輯」需執行 [`008_invoices_update_policy.sql`](supabase/migrations/008_invoices_update_policy.sql)。Invoice 幣種與「快速記一筆」一致（HKD、CNY、USD、EUR、GBP、JPY、SGD、MOP）需執行 [`009_invoices_currency_all.sql`](supabase/migrations/009_invoices_currency_all.sql)。儀表板「多幣種圖表折合 HKD」需執行 [`010_ledger_fx_rates.sql`](supabase/migrations/010_ledger_fx_rates.sql)。（001 已包含 `receipts` bucket。）
3. Supabase Auth：啟用 Email（密碼）、Google；Redirect URLs 加入 `http://localhost:3000/auth/callback`、`http://localhost:3000/auth/reset-password` 及正式域對應路徑。
4. Stripe：建立 HKD **月費**／**年費** Price（結帳**唔**再加試用期，試用只由 app／`profiles.trial_ends_at` 計）、Webhook（`customer.subscription.*`、`checkout.session.completed`）指向 `/api/stripe/webhook`。
5. `npm install` → `npm run dev`

本機要跳過「未訂閱不可記帳」可設 `NEXT_PUBLIC_DEV_FULL_ACCESS=1`（**唔好**用於正式環境）。

## 腳本

- `npm run dev` — 開發
- `npm run build` — 正式編譯
- `npm run lint` — ESLint

## 目錄概要

- `src/app/(marketing)` — 主頁、條款、私隱、聯絡、三個 SEO 工具
- `src/app/app` — 登入後記帳後台
- `src/app/api` — Stripe、聯絡表單、報表 CSV／PDF

詳細產品規格見你嘅 Cursor plan：`hk_bookkeep_webapp_mvp_87addbdf.plan.md`。

## 尚未實作（可下一步加）

- **試用結束後 T+30 電郵、T+60／T+90 刪除排程**：需 Vercel Cron（或類似）+ 以 `profiles.trial_ends_at`／`subscription_status` 篩選，用 Unosend（或 Supabase SMTP）發信、用 service role 刪資料。
- **條款／私隱全文**：目前 `(marketing)/terms` 與 `privacy` 為摘要，可換成律師審閱後嘅完整 HTML／MD。
