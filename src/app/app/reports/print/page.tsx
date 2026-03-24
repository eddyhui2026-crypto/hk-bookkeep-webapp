import Link from "next/link";
import { redirect } from "next/navigation";
import { ReportPrintBody } from "@/components/reports/ReportPrintBody";
import { fetchLedgerReportForPrint } from "@/lib/ledger-report-print";

export const dynamic = "force-dynamic";

export default async function ReportPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ ledgerId?: string; year?: string; month?: string }>;
}) {
  const sp = await searchParams;
  const ledgerId = sp.ledgerId ?? "";
  const year = Number(sp.year);
  const month = sp.month ?? null;

  const result = await fetchLedgerReportForPrint(ledgerId, year, month);

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
          返回概覽
        </Link>
      </div>
    );
  }

  return <ReportPrintBody data={result.data} />;
}
