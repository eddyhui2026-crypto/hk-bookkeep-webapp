import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { I18nProvider } from "@/components/I18nProvider";
import { MarketProvider } from "@/components/MarketProvider";
import { getMarketingMetadata } from "@/lib/market-metadata";
import {
  getMarketFromEnv,
  getPublicHtmlLang,
  getSiteName,
  marketFromHost,
  type Market,
} from "@/lib/market";
import { getRequestSiteUrl } from "@/lib/request-site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function getMarketForRequest(): Promise<Market> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  return marketFromHost(host) ?? getMarketFromEnv();
}

export async function generateMetadata(): Promise<Metadata> {
  const market = await getMarketForRequest();
  const { title, description, appleWebApp } = getMarketingMetadata(market);
  const siteUrl = await getRequestSiteUrl();
  const site = getSiteName(market);
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title as string,
      template: `%s | ${site}`,
    },
    description,
    icons: {
      icon: [{ url: "/icon", type: "image/png" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    appleWebApp,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#9333ea",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const market = await getMarketForRequest();
  const defaultLocale = market === "sg" ? "en" : "zh";
  const htmlLang = getPublicHtmlLang(market, defaultLocale);

  return (
    <html
      lang={htmlLang}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MarketProvider market={market}>
          <I18nProvider market={market}>{children}</I18nProvider>
        </MarketProvider>
      </body>
    </html>
  );
}
