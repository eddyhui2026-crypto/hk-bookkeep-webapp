import type { Locale } from "@/lib/i18n/messages";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
};

const termsZh: LegalDocument = {
  title: "服務條款",
  lastUpdated: "最後更新：2026 年 3 月 21 日",
  sections: [
    {
      title: "1. 營運者與聯絡方式",
      paragraphs: [
        "本服務「Harbix 香港記帳」（網址 https://hkbookkeep.harbix.app）由 Harbix 營運。聯絡方式：電郵 hkbookkeep@harbix.app。",
      ],
    },
    {
      title: "2. 服務內容",
      paragraphs: [
        "本服務為網上工具，協助使用者以多本「生意簿」記錄收支、分類及匯出報表（包括 CSV／PDF）。本服務並非會計、稅務或法律專業服務；任何報表或免費工具僅供參考，不構成稅務或法律意見。",
      ],
    },
    {
      title: "3. 帳戶與登入",
      paragraphs: [
        "你須提供準確資料並妥善保管帳戶。你可使用我哋支援嘅登入方式（例如 Google、電郵及密碼）。若發現未經授權使用，請立即聯絡我哋。",
      ],
    },
    {
      title: "4. 訂閱、試用、定價與付款（Stripe）",
      paragraphs: [
        "本服務收費以網站顯示為準（例如港幣 38 元／月、港幣 380 元／年；14 日免費試用，試用開始唔強制綁定付款卡；實際以結帳頁為準）。",
        "所有付款均由第三方 Stripe 處理。Stripe 商戶註冊地及收款主體以 Stripe 結帳頁、收據及 Stripe 介面顯示為準。你同意受 Stripe 條款約束。",
        "你可透過我哋提供嘅連結進入 Stripe Customer Portal，以更新付款方式、查閱帳單及取消訂閱。取消之生效日及計費週期以 Stripe 及你帳戶狀態為準。",
      ],
    },
    {
      title: "5. 試用結束、訂閱中斷與「只讀」",
      paragraphs: [
        "試用期結束時，若你未成功完成付費訂閱，你嘅帳戶可進入「只讀」：你可瀏覽現有資料及匯出 CSV／PDF，但不可新增、修改或刪除資料，直至付費成功為止。",
        "付費訂閱因任何原因中斷或屆滿未續（包括你喺 Portal 取消或付款失敗），帳戶亦可進入「只讀」（可瀏覽及匯出 CSV／PDF），直至重新訂閱成功為止。",
        "實際狀態以系統顯示及 Stripe 同步為準。",
      ],
    },
    {
      title: "6. 取消訂閱與退款",
      paragraphs: [
        "取消訂閱：請使用 Stripe Customer Portal 操作。一般情況下，已開始之計費週期不會因中途取消而按比例退款；你可在該週期內按條款繼續使用服務直至該週期結束（實際以 Stripe 設定及帳戶狀態為準）。",
        "退款：除適用法例另有強制規定外，已收取之訂閱費用一般不設中期退款。如你懷疑重複扣款、錯誤扣款或未授權交易，請先透過 Customer Portal 查閱紀錄，或聯絡 hkbookkeep@harbix.app，我哋會協助與 Stripe 紀錄核對。",
      ],
    },
    {
      title: "7. 資料與刪除",
      paragraphs: [
        "個人資料之收集、使用、保留及刪除，請參閱下方《私隱政策》（包括試用結束後 T+30／T+60／T+90 之處理）。",
        "你可於登入後使用「帳號」頁面刪除帳戶及相關資料，詳情以《私隱政策》為準。",
      ],
    },
    {
      title: "8. 可接受使用",
      paragraphs: [
        "你唔可利用本服務從事違法、侵害他人權利、或干擾系統安全之行為。我哋有權喺合理情況下暫停或終止帳戶。",
      ],
    },
    {
      title: "9. 免責與責任限制",
      paragraphs: [
        "在法律允許嘅最大範圍內，本服務按「現狀」提供；因使用或無法使用本服務所引致之損失，Harbix 嘅責任以你喺該索賠發生前 12 個月內就本服務已實際支付畀我哋之費用總額為上限（如該期間無付款則以港幣零元計）。部分司法管轄區唔允許某啲免責，以該地法例為準。",
      ],
    },
    {
      title: "10. 條款變更",
      paragraphs: [
        "我哋可更新本條款並於網站刊登。你繼續使用即表示接受修訂（重大變更建議另發電郵通知）。",
      ],
    },
    {
      title: "11. 準據語言",
      paragraphs: [
        "本條款以繁體中文書寫；如有翻譯版本，以中文版本優先解釋（除非法例另有規定）。",
      ],
    },
  ],
};

const termsEn: LegalDocument = {
  title: "Terms of Service",
  lastUpdated: "Last updated: 21 March 2026",
  sections: [
    {
      title: "1. Operator and contact",
      paragraphs: [
        'The service "Harbix Hong Kong Bookkeeping" (https://hkbookkeep.harbix.app) is operated by Harbix. Contact: hkbookkeep@harbix.app.',
      ],
    },
    {
      title: "2. The service",
      paragraphs: [
        "The service is an online tool to help you record income and expenses in multiple ledgers, categorise transactions, and export reports (including CSV/PDF). It is not accounting, tax, or legal advice; any report or free tool is for reference only.",
      ],
    },
    {
      title: "3. Accounts and sign-in",
      paragraphs: [
        "You must provide accurate information and keep your account secure. You may sign in using supported methods (e.g. Google, email and password). If you notice unauthorised use, contact us immediately.",
      ],
    },
    {
      title: "4. Subscription, trial, pricing, and payments (Stripe)",
      paragraphs: [
        "Fees are as shown on the website (e.g. HK$38/month, HK$380/year; 14-day free trial without mandatory card binding at trial start; the checkout page prevails).",
        "Payments are processed by Stripe. Stripe’s merchant location and billing entity are as shown on Stripe checkout, receipts, and the Stripe interface. You agree to Stripe’s terms.",
        "You may use our links to open the Stripe Customer Portal to update payment methods, view invoices, and cancel subscriptions. Effective cancellation dates and billing cycles follow Stripe and your account status.",
      ],
    },
    {
      title: "5. After trial, subscription lapse, and read-only",
      paragraphs: [
        "If you do not complete a paid subscription when the trial ends, your account may become read-only: you can view existing data and export CSV/PDF, but cannot add, edit, or delete data until payment succeeds.",
        "If a paid subscription ends or lapses without renewal (including cancellation in the Portal or payment failure), the account may also become read-only (view and export CSV/PDF) until you resubscribe successfully.",
        "Actual status follows the product UI and Stripe sync.",
      ],
    },
    {
      title: "6. Cancellation and refunds",
      paragraphs: [
        "To cancel, use the Stripe Customer Portal. Generally, a billing period that has already started is not refunded pro rata if you cancel mid-cycle; you may continue using the service for that period as applicable (subject to Stripe settings and your account).",
        "Except where mandatory law requires otherwise, subscription fees already paid are generally not refunded mid-term. If you suspect duplicate charges, errors, or unauthorised transactions, check the Portal first or email hkbookkeep@harbix.app and we will help reconcile with Stripe records.",
      ],
    },
    {
      title: "7. Data and deletion",
      paragraphs: [
        "For collection, use, retention, and deletion of personal data, see the Privacy Policy below (including T+30 / T+60 / T+90 after trial end).",
        "After sign-in you may delete your account and related data from the Account page, as described in the Privacy Policy.",
      ],
    },
    {
      title: "8. Acceptable use",
      paragraphs: [
        "You must not use the service unlawfully, infringe others’ rights, or harm system security. We may suspend or terminate accounts where reasonable.",
      ],
    },
    {
      title: "9. Disclaimer and liability cap",
      paragraphs: [
        "To the fullest extent permitted by law, the service is provided “as is”. Liability for loss arising from use or inability to use the service is capped at the total fees you actually paid to us in the 12 months before the claim (HK$0 if none). Some jurisdictions do not allow certain exclusions; local law applies.",
      ],
    },
    {
      title: "10. Changes",
      paragraphs: [
        "We may update these terms on the website. Continued use means acceptance (material changes should ideally be emailed separately).",
      ],
    },
    {
      title: "11. Language",
      paragraphs: [
        "These terms are written in Traditional Chinese; if there is a translation, the Chinese version prevails except where law says otherwise.",
      ],
    },
  ],
};

const privacyZh: LegalDocument = {
  title: "私隱政策",
  lastUpdated: "最後更新：2026 年 3 月 21 日",
  sections: [
    {
      title: "1. 資料控制者",
      paragraphs: [
        "負責處理你個人資料嘅一方為 Harbix。聯絡：hkbookkeep@harbix.app。",
      ],
    },
    {
      title: "2. 我哋收集咩資料",
      paragraphs: [
        "帳戶資料：例如電郵地址、登入識別（透過 Supabase Auth 等）。",
        "你主動輸入嘅業務資料：例如生意簿名稱、交易紀錄、分類、金額、幣種、備註。",
        "你上載嘅檔案：例如收據影像（儲於 Supabase Storage）。",
        "技術資料：例如 IP、裝置類型、瀏覽記錄（視乎託管商／分析設定；MVP 宜最小化）。",
        "付款資料：信用卡等付款資料由 Stripe 直接處理，我哋不會喺自己伺服器儲存你完整卡號；我哋可能透過 Stripe 收到訂閱狀態、客戶識別碼等。",
      ],
    },
    {
      title: "3. 點解要收集（用途）",
      paragraphs: [
        "提供、維持及改善記帳功能；處理訂閱及試用；發送服務相關電郵（例如電郵驗證／重設密碼、試用／訂閱提醒、試用結束後第 30 日之資料提醒）；防欺詐、保安及法例要求；回覆你透過表單提出嘅查詢（經 Unosend 以 hkbookkeep@harbix.app 發送或接收相關通知）。",
      ],
    },
    {
      title: "4. 法律基礎（香港 PDPO 角度之實務表述）",
      paragraphs: [
        "為履行你與我哋之服務合約、或在徵得你同意下、或為合法權益（例如保安）而處理；你可在法例允許範圍內聯絡我哋行使查閱或更正等權利。",
      ],
    },
    {
      title: "5. 第三方服務提供者（副處理者）",
      paragraphs: [
        "我哋使用（或可能使用）以下類別服務，佢哋或會喺境外處理資料：Stripe（付款）、Supabase（資料庫、認證、檔案儲存）、Unosend（電郵）、Vercel（網站託管）等。佢哋有其獨立私隱政策。",
      ],
    },
    {
      title: "6. 資料保留（包括試用結束後）",
      paragraphs: [
        "正常使用期間：為提供服務所需而保留。",
        "試用結束（以試用結束日為 T0）且你未成功訂閱：",
        "T+30：我哋會向你所提供嘅電郵發出提醒（例如匯出資料或訂閱）。",
        "T+60：若你仍未訂閱，我哋可刪除你嘅帳戶及相關業務資料（主資料庫內容；實作上可先「軟刪除」）。",
        "T+90：可安排對剩餘備份或物件儲存（例如收據檔案）作徹底清除。若技術上喺 T+60 已一次過清除所有副本，則毋須另設 T+90 步驟——以實際系統設計及本政策更新為準。",
        "付費用戶取消或只讀：保留期視乎條款、你嘅刪除請求及法例；一般直至你要求刪除帳戶或達上述類似刪除條件。",
        "法律或爭議：若法例要求保留較長時間，則從其規定。",
      ],
    },
    {
      title: "7. 保安",
      paragraphs: [
        "我哋採取合理技術及組織措施（例如 HTTPS、存取控制、供應商之安全功能）。互聯網傳輸並非百分之百安全。",
      ],
    },
    {
      title: "8. 你的權利",
      paragraphs: [
        "你可聯絡 hkbookkeep@harbix.app 要求查閱、更正、或（在法例允許下）刪除個人資料。",
        "登入後前往「帳號」頁面可刪除帳戶：系統會刪除你嘅登入帳戶、業務資料（生意簿／交易／分類）、以及已上載收據檔案，並會盡力取消 Stripe 訂閱及刪除本應用程式所關聯之 Stripe 客戶資料；付款機構可能按其政策保留部份帳務紀錄。",
      ],
    },
    {
      title: "9. Cookie",
      paragraphs: [
        "我哋使用必要 Cookie 以維持登入及安全；若日後加入分析／營銷類 Cookie，將更新本政策並在需要時徵求同意。",
      ],
    },
    {
      title: "10. 兒童",
      paragraphs: [
        "本服務唔擬向 18 歲以下人士提供；如發現誤收集，請聯絡我哋刪除。",
      ],
    },
    {
      title: "11. 政策修訂",
      paragraphs: [
        "我哋可更新本政策；重大變更將透過網站或電郵通知。",
      ],
    },
  ],
};

const privacyEn: LegalDocument = {
  title: "Privacy Policy",
  lastUpdated: "Last updated: 21 March 2026",
  sections: [
    {
      title: "1. Data controller",
      paragraphs: [
        "The data controller is Harbix. Contact: hkbookkeep@harbix.app.",
      ],
    },
    {
      title: "2. What we collect",
      paragraphs: [
        "Account data: e.g. email address and login identifiers (via Supabase Auth, etc.).",
        "Business data you enter: e.g. ledger names, transactions, categories, amounts, currencies, notes.",
        "Files you upload: e.g. receipt images (stored in Supabase Storage).",
        "Technical data: e.g. IP, device type, browsing logs (depends on hosting/analytics setup; keep MVP minimal).",
        "Payment data: card details are handled directly by Stripe; we do not store full card numbers on our servers; we may receive subscription status and customer IDs from Stripe.",
      ],
    },
    {
      title: "3. Why we collect it",
      paragraphs: [
        "To provide, maintain, and improve bookkeeping features; to handle subscriptions and trials; to send service emails (e.g. email verification / password reset, trial/subscription reminders, day-30 reminder after trial end); for fraud prevention, security, and legal compliance; to respond to enquiries from forms (via Unosend, using hkbookkeep@harbix.app for related notifications).",
      ],
    },
    {
      title: "4. Legal basis (practical wording, Hong Kong PDPO context)",
      paragraphs: [
        "We process data to perform our contract with you, with your consent where required, or for legitimate interests (e.g. security). You may contact us to exercise access, correction, or other rights allowed by law.",
      ],
    },
    {
      title: "5. Third-party processors",
      paragraphs: [
        "We use (or may use) services that may process data outside Hong Kong, including Stripe (payments), Supabase (database, auth, file storage), Unosend (email), Vercel (hosting), and others. Each has its own privacy policy.",
      ],
    },
    {
      title: "6. Retention (including after trial)",
      paragraphs: [
        "During normal use: we retain data as needed to provide the service.",
        "If trial ends (T0) and you do not subscribe:",
        "T+30: we email the address you provided (e.g. to export data or subscribe).",
        "T+60: if you still have not subscribed, we may delete your account and related business data in the primary database (implementation may use soft delete first).",
        "T+90: we may purge remaining backups or object storage (e.g. receipts). If all copies were already removed at T+60, a separate T+90 step may not be needed—follow actual system design and policy updates.",
        "Paid users who cancel or are read-only: retention depends on terms, your deletion requests, and law; generally until you request account deletion or similar conditions apply.",
        "Legal or disputes: if law requires longer retention, we follow that requirement.",
      ],
    },
    {
      title: "7. Security",
      paragraphs: [
        "We use reasonable technical and organisational measures (e.g. HTTPS, access controls, vendor security features). Transmission over the internet is not 100% secure.",
      ],
    },
    {
      title: "8. Your rights",
      paragraphs: [
        "You may contact hkbookkeep@harbix.app to request access, correction, or (where law allows) deletion.",
        "After sign-in, open the Account page to delete your account: we remove your login, business data (ledgers, transactions, categories), and uploaded receipts, and we cancel Stripe subscriptions and delete the Stripe customer record linked to this app where possible; Stripe may retain some billing records under its own policies.",
      ],
    },
    {
      title: "9. Cookies",
      paragraphs: [
        "We use necessary cookies for sign-in and security; if we add analytics/marketing cookies later, we will update this policy and obtain consent where required.",
      ],
    },
    {
      title: "10. Children",
      paragraphs: [
        "The service is not intended for people under 18; if we learn we collected data by mistake, contact us to delete it.",
      ],
    },
    {
      title: "11. Policy changes",
      paragraphs: [
        "We may update this policy; material changes will be notified on the site or by email.",
      ],
    },
  ],
};

export function getTerms(locale: Locale): LegalDocument {
  return locale === "en" ? termsEn : termsZh;
}

export function getPrivacy(locale: Locale): LegalDocument {
  return locale === "en" ? privacyEn : privacyZh;
}
