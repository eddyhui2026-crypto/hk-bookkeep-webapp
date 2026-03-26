import Link from "next/link";
import { redirect } from "next/navigation";
import { TaxSummaryPrintBody } from "@/components/reports/TaxSummaryPrintBody";
import { fetchLedgerTaxSummaryForPrint } from "@/lib/ledger-tax-summary-print";
import { getMarket } from "@/lib/market-server";
import type { Locale } from "@/lib/i18n/messages";

export const dynamic = "force-dynamic";

export default async function TaxSummaryPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ ledgerId?: string; taxYear?: string; locale?: string }>;
}) {
  const sp = await searchParams;
  const ledgerId = sp.ledgerId ?? "";
  const taxYear = Number(sp.taxYear);
  const locale: Locale = sp.locale === "en" ? "en" : "zh";

  const market = await getMarket();
  const result = await fetchLedgerTaxSummaryForPrint(ledgerId, taxYear, market, locale);

  if (!result.ok) {
    if (result.status === 401) {
      redirect("/login");
    }
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-foreground">{result.message}</p>
        <Link
          href="/app"
          className="mt-4 inline-block text-sm text-brand underline"
        >
          {locale === "en" ? "Back to overview" : "返回概覽"}
        </Link>
      </div>
    );
  }

  return <TaxSummaryPrintBody data={result.data} />;
}
