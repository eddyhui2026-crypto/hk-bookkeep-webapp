import archiver from "archiver";
import { NextResponse } from "next/server";
import {
  RECEIPT_ZIP_MAX_BYTES_UNCOMPRESSED,
  RECEIPT_ZIP_MAX_FILES,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { getMarketFromEnv, marketFromHost, type Market } from "@/lib/market";
import { taxPeriodForExport } from "@/lib/reports";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function safeZipEntryName(txDate: string, txId: string, receiptPath: string): string {
  const ext = receiptPath.includes(".") ? receiptPath.slice(receiptPath.lastIndexOf(".")) : ".jpg";
  const short = txId.replace(/-/g, "").slice(0, 8);
  const d = txDate.replace(/-/g, "");
  const safe = `${d}_${short}${ext}`.replace(/[^a-zA-Z0-9._-]/g, "_");
  return safe || `receipt_${short}${ext}`;
}

export async function GET(request: Request) {
  const reqUrl = new URL(request.url);
  const { searchParams } = reqUrl;
  const ledgerId = searchParams.get("ledgerId") ?? "";
  const taxYear = Number(searchParams.get("taxYear"));

  if (!ledgerId || !Number.isInteger(taxYear) || taxYear < 2000 || taxYear > 2100) {
    return NextResponse.json({ error: "缺少 ledgerId 或有效 taxYear" }, { status: 400 });
  }

  const market: Market = marketFromHost(reqUrl.host) ?? getMarketFromEnv();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const range = taxPeriodForExport(market, taxYear);

  const { data: ledger, error: le } = await supabase
    .from("ledgers")
    .select("id")
    .eq("id", ledgerId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (le || !ledger) {
    return NextResponse.json({ error: "找不到生意簿" }, { status: 404 });
  }

  const { data: txs, error: te } = await supabase
    .from("transactions")
    .select("id, tx_date, receipt_path")
    .eq("ledger_id", ledgerId)
    .gte("tx_date", range.start)
    .lte("tx_date", range.end)
    .not("receipt_path", "is", null);

  if (te) {
    return NextResponse.json({ error: te.message }, { status: 500 });
  }

  const rows = (txs ?? []).filter(
    (t): t is typeof t & { receipt_path: string } =>
      typeof t.receipt_path === "string" && t.receipt_path.length > 0
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "此期間沒有已上傳收據" }, { status: 404 });
  }

  if (rows.length > RECEIPT_ZIP_MAX_FILES) {
    return NextResponse.json(
      {
        error: `收據數量超過上限（${RECEIPT_ZIP_MAX_FILES}）。請縮短期間或分批下載。`,
      },
      { status: 413 }
    );
  }

  const usedNames = new Map<string, number>();
  const parts: { name: string; buf: Buffer }[] = [];
  let uncompressedTotal = 0;

  for (const tx of rows) {
    const { data: blob, error: downErr } = await supabase.storage
      .from("receipts")
      .download(tx.receipt_path);

    if (downErr || !blob) {
      return NextResponse.json(
        { error: downErr?.message ?? "無法下載收據" },
        { status: 500 }
      );
    }

    const buf = Buffer.from(await blob.arrayBuffer());
    if (uncompressedTotal + buf.length > RECEIPT_ZIP_MAX_BYTES_UNCOMPRESSED) {
      const mb = Math.round(RECEIPT_ZIP_MAX_BYTES_UNCOMPRESSED / 1024 / 1024);
      return NextResponse.json(
        { error: `收據總大小超過上限（約 ${mb} MB）。請縮短期間或減少附件。` },
        { status: 413 }
      );
    }
    uncompressedTotal += buf.length;

    let base = safeZipEntryName(tx.tx_date, tx.id, tx.receipt_path);
    const n = (usedNames.get(base) ?? 0) + 1;
    usedNames.set(base, n);
    if (n > 1) {
      const dot = base.lastIndexOf(".");
      if (dot === -1) base = `${base}_${n}`;
      else base = `${base.slice(0, dot)}_${n}${base.slice(dot)}`;
    }

    parts.push({ name: base, buf });
  }

  const chunks: Buffer[] = [];
  const archive = archiver("zip", { zlib: { level: 6 } });
  archive.on("data", (c: Buffer) => chunks.push(c));

  try {
    for (const p of parts) {
      archive.append(p.buf, { name: p.name });
    }
    await new Promise<void>((resolve, reject) => {
      archive.on("error", reject);
      archive.on("end", () => resolve());
      archive.finalize();
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "建立 ZIP 失敗" },
      { status: 500 }
    );
  }

  const zipBufResult = Buffer.concat(chunks);
  const filename = `hkbookkeep-receipts-${ledgerId.slice(0, 8)}-ty${taxYear}.zip`;

  return new NextResponse(new Uint8Array(zipBufResult), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
