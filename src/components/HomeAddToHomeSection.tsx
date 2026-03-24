"use client";

import Image from "next/image";
import { useI18n } from "@/components/I18nProvider";

/** 示意：Safari 頂部網址列 */
function IllustrationIosSafariTop() {
  return (
    <svg
      viewBox="0 0 240 88"
      className="mx-auto h-auto w-full max-w-[220px] text-foreground"
      aria-hidden
    >
      <rect
        x="8"
        y="8"
        width="224"
        height="72"
        rx="20"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <rect x="24" y="24" width="192" height="28" rx="10" className="fill-brand/10 stroke-brand/30" strokeWidth="1.5" />
      <text
        x="120"
        y="42"
        textAnchor="middle"
        className="fill-foreground/70 text-[10px]"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        hkbookkeep.harbix.app
      </text>
      <text
        x="120"
        y="62"
        textAnchor="middle"
        className="fill-muted text-[9px]"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        Safari
      </text>
    </svg>
  );
}

/** 示意：iPhone 底欄，中間為「分享」圖示（方框＋箭嘴） */
function IllustrationIosShareBar() {
  return (
    <svg
      viewBox="0 0 240 100"
      className="mx-auto h-auto w-full max-w-[220px] text-foreground"
      aria-hidden
    >
      <rect
        x="8"
        y="8"
        width="224"
        height="84"
        rx="20"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <text
        x="120"
        y="38"
        textAnchor="middle"
        className="fill-muted text-[11px]"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        safari · hkbookkeep…
      </text>
      <line x1="20" y1="48" x2="220" y2="48" className="stroke-border" strokeWidth="1" />
      <g transform="translate(0, 52)">
        <circle cx="48" cy="22" r="16" className="fill-brand/10" />
        <rect x="108" y="6" width="32" height="32" rx="8" className="fill-brand/25 stroke-brand" strokeWidth="2" />
        <path
          d="M124 14 v8 M124 22 h-5 M124 22 h5 M118 16 l6-4 6 4"
          className="stroke-brand stroke-[2.5] fill-none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="192" cy="22" r="16" className="fill-brand/10" />
      </g>
    </svg>
  );
}

/** 示意：分享表單內一列「加入主畫面」 */
function IllustrationIosSheetRow() {
  return (
    <svg
      viewBox="0 0 240 140"
      className="mx-auto h-auto w-full max-w-[220px] text-foreground"
      aria-hidden
    >
      <rect
        x="12"
        y="12"
        width="216"
        height="116"
        rx="16"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <rect x="24" y="28" width="192" height="28" rx="8" className="fill-brand/5" />
      <rect x="24" y="64" width="192" height="36" rx="10" className="fill-brand/15 stroke-brand/60" strokeWidth="2" />
      <rect x="36" y="74" width="16" height="16" rx="3" className="stroke-brand fill-none" strokeWidth="2" />
      <line x1="60" y1="82" x2="200" y2="82" className="stroke-foreground/40" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/** 示意：Android 主畫面捷徑（色調偏綠） */
function IllustrationAndroidHomeGrid() {
  return (
    <svg
      viewBox="0 0 240 160"
      className="mx-auto h-auto w-full max-w-[220px] text-foreground"
      aria-hidden
    >
      <rect
        x="10"
        y="10"
        width="220"
        height="140"
        rx="24"
        className="fill-income/5 stroke-border"
        strokeWidth="2"
      />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={32 + (i % 2) * 88}
          y={32 + Math.floor(i / 2) * 72}
          width="56"
          height="56"
          rx="14"
          className="fill-card stroke-border"
          strokeWidth="1.5"
        />
      ))}
      <rect
        x="32"
        y={32 + 72}
        width="56"
        height="56"
        rx="14"
        className="fill-income stroke-white"
        strokeWidth="3"
      />
      <path
        d="M48 68 L60 80 L72 64"
        className="stroke-white fill-none stroke-[2.5]"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 示意：主畫面多個圖格，其一為新加入嘅捷徑 */
function IllustrationIosHomeGrid() {
  return (
    <svg
      viewBox="0 0 240 160"
      className="mx-auto h-auto w-full max-w-[220px] text-foreground"
      aria-hidden
    >
      <rect
        x="10"
        y="10"
        width="220"
        height="140"
        rx="24"
        className="fill-brand/5 stroke-border"
        strokeWidth="2"
      />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={32 + (i % 2) * 88}
          y={32 + Math.floor(i / 2) * 72}
          width="56"
          height="56"
          rx="14"
          className="fill-card stroke-border"
          strokeWidth="1.5"
        />
      ))}
      <rect
        x="120"
        y="32"
        width="56"
        height="56"
        rx="14"
        className="fill-brand stroke-white"
        strokeWidth="3"
      />
      <path
        d="M136 52 L148 64 L160 48"
        className="stroke-white fill-none stroke-[2.5]"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 示意：Chrome 頂欄 ⋮ 選單 */
function IllustrationAndroidMenu() {
  return (
    <svg
      viewBox="0 0 240 100"
      className="mx-auto h-auto w-full max-w-[220px] text-foreground"
      aria-hidden
    >
      <rect
        x="8"
        y="8"
        width="224"
        height="84"
        rx="18"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <rect x="20" y="20" width="140" height="10" rx="4" className="fill-muted/30" />
      <circle cx="208" cy="28" r="14" className="fill-brand/20 stroke-brand" strokeWidth="2" />
      <circle cx="204" cy="24" r="2" className="fill-foreground" />
      <circle cx="204" cy="28" r="2" className="fill-foreground" />
      <circle cx="204" cy="32" r="2" className="fill-foreground" />
    </svg>
  );
}

/** 示意：選單內「加到主畫面」一列 */
function IllustrationAndroidAddRow() {
  return (
    <svg
      viewBox="0 0 240 130"
      className="mx-auto h-auto w-full max-w-[220px] text-foreground"
      aria-hidden
    >
      <rect
        x="12"
        y="12"
        width="216"
        height="106"
        rx="14"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <rect x="20" y="24" width="200" height="22" rx="6" className="fill-muted/15" />
      <rect x="20" y="54" width="200" height="30" rx="8" className="fill-income/15 stroke-income/50" strokeWidth="2" />
      <path
        d="M36 62 h10 v10 h-10 z M41 58 v-4"
        className="stroke-income fill-none stroke-[2]"
        strokeLinejoin="round"
      />
      <line x1="54" y1="69" x2="200" y2="69" className="stroke-foreground/35" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

type StepBlockProps = {
  stepLabel: string;
  title: string;
  body: string;
  figure: React.ReactNode;
  figCaption: string;
};

function StepBlock({ stepLabel, title, body, figure, figCaption }: StepBlockProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="mx-auto w-full max-w-[200px] shrink-0 sm:mx-0">
          {figure}
          <p className="mt-2 text-center text-xs text-muted">{figCaption}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">{stepLabel}</p>
          <h3 className="mt-1 text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
        </div>
      </div>
    </div>
  );
}

export function HomeAddToHomeSection() {
  const { t } = useI18n();

  return (
    <section className="mt-16 rounded-3xl border border-brand/25 bg-gradient-to-b from-brand/10 via-card to-card p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {t("home.addToHomeTitle")}
      </h2>
      <div className="relative mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-md">
        <Image
          src="/add-to-home-banner.png"
          alt={t("home.addToHomeBannerAlt")}
          width={1200}
          height={600}
          className="h-auto w-full object-cover"
          sizes="(max-width: 1024px) 100vw, 896px"
        />
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/90">
        {t("home.addToHomeIntro")}
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{t("home.addToHomeWhy")}</p>
      <div className="mt-4 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-foreground/90">
        <strong className="font-semibold text-foreground">{t("home.addToHomeTipTitle")}</strong>
        {t("home.addToHomeTipBody")}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-8">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <span className="rounded-full bg-brand/15 px-3 py-1 text-sm text-brand">
              {t("home.addToHomeIosBadge")}
            </span>
          </h3>
          <div className="mt-5 space-y-4">
            <StepBlock
              stepLabel={t("home.addToHomeStepLabel", { n: "1" })}
              title={t("home.addToHomeIosStep1Title")}
              body={t("home.addToHomeIosStep1Body")}
              figure={<IllustrationIosSafariTop />}
              figCaption={t("home.addToHomeIosFig1")}
            />
            <StepBlock
              stepLabel={t("home.addToHomeStepLabel", { n: "2" })}
              title={t("home.addToHomeIosStep2Title")}
              body={t("home.addToHomeIosStep2Body")}
              figure={<IllustrationIosShareBar />}
              figCaption={t("home.addToHomeIosFig2")}
            />
            <StepBlock
              stepLabel={t("home.addToHomeStepLabel", { n: "3" })}
              title={t("home.addToHomeIosStep3Title")}
              body={t("home.addToHomeIosStep3Body")}
              figure={<IllustrationIosSheetRow />}
              figCaption={t("home.addToHomeIosFig3")}
            />
            <StepBlock
              stepLabel={t("home.addToHomeStepLabel", { n: "4" })}
              title={t("home.addToHomeIosStep4Title")}
              body={t("home.addToHomeIosStep4Body")}
              figure={<IllustrationIosHomeGrid />}
              figCaption={t("home.addToHomeIosFig4")}
            />
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <span className="rounded-full bg-income/15 px-3 py-1 text-sm text-income">
              {t("home.addToHomeAndroidBadge")}
            </span>
          </h3>
          <div className="mt-5 space-y-4">
            <StepBlock
              stepLabel={t("home.addToHomeStepLabel", { n: "1" })}
              title={t("home.addToHomeAndroidStep1Title")}
              body={t("home.addToHomeAndroidStep1Body")}
              figure={<IllustrationAndroidMenu />}
              figCaption={t("home.addToHomeAndroidFig1")}
            />
            <StepBlock
              stepLabel={t("home.addToHomeStepLabel", { n: "2" })}
              title={t("home.addToHomeAndroidStep2Title")}
              body={t("home.addToHomeAndroidStep2Body")}
              figure={<IllustrationAndroidAddRow />}
              figCaption={t("home.addToHomeAndroidFig2")}
            />
            <StepBlock
              stepLabel={t("home.addToHomeStepLabel", { n: "3" })}
              title={t("home.addToHomeAndroidStep3Title")}
              body={t("home.addToHomeAndroidStep3Body")}
              figure={<IllustrationAndroidHomeGrid />}
              figCaption={t("home.addToHomeAndroidFig3")}
            />
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-muted">{t("home.addToHomeFootnote")}</p>
    </section>
  );
}
