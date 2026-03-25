/**
 * 疊加喺 `hkMessages` 之上；**tw** 只有 zh；**sg** 有 en / zh（簡體以 zh patch 寫入）。
 * App 內未覆蓋嘅 key 仍 fallback 香港稿（你審稿時可逐步換）。
 */
export const marketPatches = {
  tw: {
    zh: {
      localeSwitch: "English",
      nav: {
        articles: "文章",
        tools: "工具",
        contact: "聯絡",
        login: "登入",
      },
      footer: {
        rights: "© {year} Harbix · TWBookKeep · 非專業稅務或法律意見",
      },
      home: {
        tag: "TWBookKeep · 台灣記帳",
        titleLine1: "接案、小商家、網拍",
        titleLine2: "輕量記帳",
        lead:
          "記下每一筆收入與支出，還有簡易 Invoice 開立；結算前不用熬夜整理水單與截圖。",
        intro:
          "多本「生意簿」分開接案與賣場，分類與顏色一目了然；收據拍照上傳、匯出 CSV、報表列印另存 PDF。內建簡易 Invoice：清單、編輯、瀏覽器列印／存 PDF、預設收款欄位，入帳可一鍵轉成收入。",
        valueBlurb:
          "月費約一杯手搖的價格，省下整理憑證、對帳、通宵做表與往返寄送 invoice 的時間。",
        mobileBlurb:
          "手機版為日常使用設計：外出見單據隨手拍、馬上記一筆；右下角捷徑優先開相機。要開立給客戶的單據也可用簡易 Invoice，列印或存 PDF。",
        li1: "NT$150／月 · 年繳 NT$1,500（年繳約省近 2 個月月費）",
        li2: "14 天免費試用",
        li3: "支援 TWD、USD 等常用幣別",
        li4: "簡易 Invoice：開立、列印／PDF、預設欄位；可一鍵轉收入",
        li5: "首頁即可試用免費工具，免登入",
        addToHomeTitle: "把 TWBookKeep 加到主畫面，像 App 一樣一點即開",
        addToHomeIntro:
          "在台灣許多人習慣用 LINE、IG、手機瀏覽器。用 Safari（iPhone）或 Chrome（Android）將本站「加入主畫面」，主畫面會出現圖示，使用體驗接近原生 App。",
        addToHomeWhy: "不必多裝一個巨型 App，也永遠是最新版網頁功能。",
        addToHomeIosStep4Body:
          "回到主畫面會看到捷徑圖示；一點就開 TWBookKeep，不必再找連結。",
        toolsHeading: "免費工具",
        toolsIntro:
          "打開即可試算稅負示意、時薪與廣告占比（僅供參考，非專業意見）。",
        toolCard1: "營所稅／所得示範（極簡）",
        toolCard2: "自由工作者時薪回推",
        toolCard3: "網店廣告占比",
        allTools: "全部工具",
        ctaLogin: "登入／開始",
        ctaTools: "免費工具",
        audienceFitTitle: "適合用 TWBookKeep 的人",
        audienceFit1: "自由工作者（設計、影像、文字、教學等）",
        audienceFit2: "網拍／電商（蝦皮、官網、社群賣場等）",
        audienceFit3: "一人公司、小型工作室",
        audienceFit4: "剛開始經營、想先簡單記帳的人",
        audienceFit5: "不需要完整會計系統的人",
        audienceFit6: "主要想追蹤收入與支出的人",
        audienceFit7: "年底要整理給報稅或會計師的人",
        audienceFit8: "要開立給客戶的單據、又不想與記帳分兩套工具的人",
        audienceNotTitle: "可能不適合",
        audienceNot1: "有薪資與勞健保等複雜人事",
        audienceNot2: "需要合併報表或銀行自動對帳",
        audienceNot3: "需要完整資產負債表／成本會計",
        audienceNot4: "要與多名會計師線上協作流程",
        audienceNot5: "中大型公司內控需求",
        audienceNot6: "僅適合極簡情境，非 ERP",
      },
      toolProfit: {
        title: "營所稅／生意所得示範估算",
        disclaimer:
          "免責：非稅務意見。以下假設為營利事業所得稅 **20%** 之教學用示範；獨資、執行業務等情形可能適用 **綜合所得稅累進** ，請諮詢專業。實際須依財政部／國稅相關規定。",
        label: "估計課稅所得（TWD，全年示範）",
        estLabel: "示範稅額（TWD）",
        ctaLink: "試用 TWBookKeep",
      },
      toolFreelance: {
        linkTax: "營所稅示範",
        target: "目標月入（TWD）",
        expenses: "每月固定支出（TWD，可選）",
        resultLabel: "估算應達時薪（TWD／小時）",
        cta: "用 TWBookKeep 分多本生意簿",
      },
      toolAd: {
        linkTax: "營所稅示範",
        revenue: "期間營業額（TWD）",
        adSpend: "廣告費（TWD）",
        cta: "用 TWBookKeep 分攤平台與廣告",
      },
      login: {
        title: "登入 {site}",
      },
      dashboard: {
        monthly: "月付 NT$150／月",
        yearly: "年付 NT$1,500",
      },
    },
  },
  sg: {
    en: {
      nav: { articles: "Articles", tools: "Tools", contact: "Contact", login: "Log in" },
      footer: {
        rights:
          "© {year} Harbix · SGBookKeep · Not professional tax or legal advice",
      },
      home: {
        tag: "SGBookKeep — Singapore",
        titleLine1: "For freelancers & small businesses",
        titleLine2: "Simple bookkeeping, without the year-end stress.",
        lead:
          "Track income & expenses and create simple invoices in one place.",
        intro:
          "Multiple ledgers, receipt photo capture, CSV export, and PDF reports. Generate simple invoices that can be printed or saved as PDF, and convert to income in one click.",
        valueBlurb:
          "From only SGD 6.50/month. Save hours on receipts and reconciliation.",
        mobileBlurb:
          "Mobile-first: snap receipts on the go. The quick button opens the camera instantly.",
        li1: "SGD 6.50/mo · SGD 65/year (annual ≈ two months free vs monthly)",
        li2: "14-day free trial",
        li3: "SGD, USD, and common currencies",
        li4: "Simple invoices: print/PDF; book income in one tap",
        li5: "Try free tools on the homepage — no sign-in",
        addToHomeTitle: "Add SGBookKeep to your home screen",
        addToHomeIntro:
          "Use Safari (iOS) or Chrome (Android) to add this site to your home screen for quick access.",
        addToHomeIosStep4Body:
          "You’ll get a shortcut that opens SGBookKeep in one tap.",
        toolsHeading: "Free tools",
        toolsIntro:
          "Rough corporate-tax demo, hourly rate, and ad ratio (informational only).",
        toolCard1: "Corporate tax demo (simplified)",
        toolCard2: "Freelance hourly rate",
        toolCard3: "Ad spend ratio",
        audienceFitTitle: "Good fit",
        audienceFit1: "Sole props and small online sellers",
        audienceFit2: "People who need simple P&L by category",
        audienceFit3: "Anyone who wants invoices next to their books",
        audienceFit4: "Multi-currency selling in SGD terms",
        audienceNotTitle: "Not a fit",
        audienceNot1: "Payroll / CPF auto rules you need built-in",
        audienceNot2: "Full statutory filing inside the app",
        audienceNot3: "Balance sheet & audit trail packages",
        audienceNot4: "Bank feed reconciliation required",
        audienceNot5: "Large team expense workflows",
        audienceNot6: "Mid-size corporate finance",
      },
      toolProfit: {
        title: "Corporate income tax (very simplified demo)",
        disclaimer:
          "Not tax advice. Demo uses IRAS headline 17% on chargeable income after partial tax exemption on the first S$200,000 (YA 2020+ rules, simplified). Rebates and your specific reliefs are not applied. For freelancers, personal income tax may apply instead—ask a tax professional.",
        label: "Chargeable income (SGD, annual demo)",
        estLabel: "Demo tax (SGD)",
        ctaLink: "Try SGBookKeep",
      },
      toolFreelance: {
        linkTax: "Tax demo",
        target: "Target monthly income (SGD)",
        expenses: "Monthly fixed costs (SGD, optional)",
        resultLabel: "Implied hourly rate (SGD/hr)",
        cta: "Use SGBookKeep for multi-ledger books",
      },
      toolAd: {
        linkTax: "Tax demo",
        revenue: "Revenue (SGD)",
        adSpend: "Ad spend (SGD)",
        cta: "Use SGBookKeep to track fees and ads",
      },
      login: { title: "Sign in to {site}" },
      dashboard: {
        monthly: "Monthly S$6.50/mo",
        yearly: "Yearly S$65",
      },
    },
    zh: {
      localeSwitch: "English",
      nav: {
        articles: "文章",
        tools: "工具",
        contact: "联系",
        login: "登录",
      },
      footer: {
        rights: "© {year} Harbix · SGBookKeep · 非专业税务或法律意见",
      },
      home: {
        tag: "SGBookKeep — 新加坡",
        titleLine1: "适合自由职业者与小商家",
        titleLine2: "轻量记账，减少年底整理压力",
        lead: "记录收支并开具简易 Invoice。",
        intro:
          "多账本分类清晰；收据拍照、导出 CSV、报表打印 PDF。简易 Invoice 可浏览器打印或保存 PDF，一键转为收入记录。",
        valueBlurb: "每月仅 SGD 6.50. 帮你省下整理单据和对账的时间。",
        mobileBlurb: "手机优先：随手拍收据；快捷按钮优先打开相机。",
        li1: "SGD 6.50／月 · 年付 SGD 65（年付约省近 2 个月月费）",
        li2: "14 天免费试用",
        li3: "常用新币、外币记账",
        li4: "简易 Invoice：打印／PDF；一键转收入",
        li5: "首页即可试用免费工具，无需登录",
        addToHomeTitle: "将 SGBookKeep 添加到主屏幕",
        addToHomeIntro: "用 Safari 或 Chrome 将本站加入主屏幕，一点即开。",
        addToHomeIosStep4Body: "主屏幕会出现快捷方式，一点打开 SGBookKeep。",
        toolsHeading: "免费工具",
        toolsIntro: "税负示意、时薪与广告占比（仅供参考）。",
        toolCard1: "企业所得税示意（极简）",
        toolCard2: "自由职业时薪推算",
        toolCard3: "网店广告占比",
        audienceFitTitle: "适合谁",
        audienceFit1: "独资、小卖家、多平台散户",
        audienceFit2: "需要按分类看清收支结构",
        audienceFit3: "希望发票与记账同一处",
        audienceNotTitle: "不适合",
        audienceNot1: "复杂薪资／CPF 自动化",
        audienceNot2: "需内置法定申报全流程",
        audienceNot3: "需完整资产负债表合规包",
        audienceNot4: "必须银行流水自动对账",
        audienceNot5: "大型企业流程",
        audienceNot6: "中型公司财务中台",
      },
      toolProfit: {
        title: "企业所得税示意估算",
        disclaimer:
          "免责：非税务意见。示范采用 IRAS 17% 税率，并对首 20 万新元应课税入息按 YA2020+ 部分免税额简化；**不计**年度回扣。若为个人执业所得，可能适用个税——请咨询专业人士。",
        label: "应课税入息示范（SGD，全年）",
        estLabel: "示范税款（SGD）",
        ctaLink: "试用 SGBookKeep",
      },
      toolFreelance: {
        linkTax: "税负示意",
        target: "目标月入（SGD）",
        expenses: "每月固定开支（SGD，可选）",
        resultLabel: "估算时薪（SGD／小时）",
        cta: "用 SGBookKeep 分账本管理",
      },
      toolAd: {
        linkTax: "税负示意",
        revenue: "期间营业额（SGD）",
        adSpend: "广告费（SGD）",
        cta: "用 SGBookKeep 记录平台与广告",
      },
      login: { title: "登录 {site}" },
      dashboard: {
        monthly: "月付 S$6.50／月",
        yearly: "年付 S$65",
      },
    },
  },
} as const;
