export type WeekendAdjustment = 'none' | 'next' | 'prev' | 'nearest';
export type RecurrenceKind = 'none' | 'simple' | 'rrule';

export type SimpleRecurrence =
  | { type: 'weekly'; interval?: number; daysOfWeek: number[] }
  | { type: 'everyNDays'; n: number }
  | { type: 'biweekly'; weekday?: number }
  | { type: 'monthlyDay'; day: number }
  | { type: 'monthlyOrdinal'; ordinal: 1|2|3|4|-1; weekday: 0|1|2|3|4|5|6 }
  | { type: 'semiMonthly'; days: [number, number] }
  | { type: 'quarterly'; day: number }
  | { type: 'semiannual'; monthDays: Array<{ month: number; day: number }> }
  | { type: 'annual'; month: number; day: number }
  | { type: 'customDays'; days: number[] };

export interface RecurrencePayload {
  recurrenceKind: RecurrenceKind;
  simple?: SimpleRecurrence;
  rrule?: string;
  anchorDate: string;
  endDate?: string | null;
  count?: number | null;
  timezone?: string;
  weekendAdjustment?: WeekendAdjustment;
  includeDates?: string[];
  excludeDates?: string[];
}
