export function toLocalDateFromYMD(ymd: string): Date | undefined {
  if (!ymd) {
    return;
  }

  // Avoids the UTC parse of new Date('YYYY-MM-DD')
  const [y, m, d] = ymd.split('-').map(Number);

  if (y && m && d) {
    return new Date(y, m - 1, d); // local midnight
  }
}

export function toYMDLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${ y }-${ m }-${ d }`;
}
