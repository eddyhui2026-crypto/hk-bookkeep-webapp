export function endOfCalendarMonth(year: number, month1to12: number): Date {
  return new Date(year, month1to12, 0);
}

export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function monthBounds(year: number, month1to12: number) {
  const start = `${year}-${String(month1to12).padStart(2, "0")}-01`;
  const end = formatDate(endOfCalendarMonth(year, month1to12));
  return { start, end };
}

export function yearBounds(year: number) {
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

/** 香港評稅年度：4 月 1 日起至翌年 3 月 31 日。`startYear` = 該年度開始嘅曆年（即 4 月所屬年）。 */
export function taxYearBounds(startYear: number) {
  const y = String(startYear);
  const y1 = String(startYear + 1);
  return { start: `${y}-04-01`, end: `${y1}-03-31` };
}

/** 目前日期所屬評稅年度之「開始曆年」（例：2026-03-15 → 2024；2026-04-01 → 2026） */
export function currentTaxYearStart(from: Date = new Date()): number {
  const year = from.getFullYear();
  const month = from.getMonth() + 1;
  return month >= 4 ? year : year - 1;
}
