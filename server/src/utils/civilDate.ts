export function fromYMD(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);

  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)); // UTC-noon
}

export function ymd(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)); // UTC-noon
}

export function toYMD(date: Date): string {
  // normalize to UTC date (noon) before slicing, so TZ never flips the day
  const u = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    12, 0, 0
  ));

  return u.toISOString().slice(0, 10);
}
