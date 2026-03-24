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
