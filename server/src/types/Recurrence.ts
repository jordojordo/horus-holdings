export type WeekendAdjustment = 'none' | 'next' | 'prev' | 'nearest';

export type RecurrenceKind = 'none' | 'simple' | 'rrule';

export type SimpleRecurrence =
  | { type: 'weekly'; interval?: number; daysOfWeek: number[] }        // 0=Sun .. 6=Sat
  | { type: 'everyNDays'; n: number }
  | { type: 'biweekly'; weekday?: number }                             // anchor weekday if omitted
  | { type: 'monthlyDay'; day: number }                                // 1..31 (clamped)
  | { type: 'monthlyOrdinal'; ordinal: 1|2|3|4|-1; weekday: 0|1|2|3|4|5|6 }
  | { type: 'semiMonthly'; days: [number, number] }                    // e.g., [1, 15]
  | { type: 'quarterly'; day: number }                                 // day of month
  | { type: 'semiannual'; monthDays: Array<{ month: number; day: number }> } // months 1..12
  | { type: 'annual'; month: number; day: number }
  | { type: 'customDays'; days: number[] };                            // CSV of days

export interface RecurrencePayload {
  recurrenceKind:     RecurrenceKind;
  simple?:            SimpleRecurrence;
  rrule?:             string; // iCal text (may include DTSTART + multiple RRULE lines)
  anchorDate:         string; // 'YYYY-MM-DD'
  endDate?:           string | null;
  count?:             number | null; // optional cap on instances
  timezone?:          string; // IANA tz e.g., 'America/New_York'
  weekendAdjustment?: WeekendAdjustment;
  includeDates?:      string[]; // 'YYYY-MM-DD'
  excludeDates?:      string[];
}

export interface ExpandWindow {
  start: string; // 'YYYY-MM-DD'
  end:   string; // 'YYYY-MM-DD'
}
