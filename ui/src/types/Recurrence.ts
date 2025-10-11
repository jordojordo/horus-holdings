export const SIMPLE_TYPES = [
  'weekly',
  'everyNDays',
  'biweekly',
  'monthlyDay',
  'monthlyOrdinal',
  'semiMonthly',
  'quarterly',
  'semiannual',
  'annual',
  'customDays',
] as const;

export type SimpleType = (typeof SIMPLE_TYPES)[number];

export const SIMPLE_TYPE_LABELS: Record<SimpleType, string> = {
  weekly:         'Weekly',
  everyNDays:     'Every N Days',
  biweekly:       'Biweekly',
  monthlyDay:     'Monthly (day)',
  monthlyOrdinal: 'Monthly (ordinal)',
  semiMonthly:    'Semi-Monthly',
  quarterly:      'Quarterly',
  semiannual:     'Semiannual',
  annual:         'Annual',
  customDays:     'Custom Days',
} as const;

export const DEFAULT_SIMPLE_BY_TYPE: Record<SimpleType, SimpleRecurrence> = {
  weekly: {
    type:       'weekly',
    interval:   1,
    daysOfWeek: [],
  },
  everyNDays: {
    type: 'everyNDays',
    n:    2,
  },
  biweekly:   { type: 'biweekly' },
  monthlyDay: {
    type: 'monthlyDay',
    day:  1,
  },
  monthlyOrdinal: {
    type:    'monthlyOrdinal',
    ordinal: 1 as MonthlyOrdinal,
    weekday: 1 as WeekdayOrdinal,
  },
  semiMonthly: {
    type: 'semiMonthly',
    days: [1, 15],
  },
  quarterly: {
    type: 'quarterly',
    day:  1,
  },
  semiannual: {
    type:      'semiannual',
    monthDays: [
      {
        month: 1,
        day:   1,
      },
      {
        month: 7,
        day:   1,
      },
    ],
  },
  annual: {
    type:  'annual',
    month: 1,
    day:   1,
  },
  customDays: {
    type: 'customDays',
    days: [1, 15],
  },
} as const;

export type WeekendAdjustment = 'none' | 'next' | 'prev' | 'nearest';
export type RecurrenceKind = 'none' | 'simple' | 'rrule';
export type MonthlyOrdinal = 1 | 2 | 3 | 4 | -1;
export type WeekdayOrdinal = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type SemiAnnual = Array<{ month: number; day: number }>;

export type SimpleRecurrence =
  | { type: 'weekly'; interval?: number; daysOfWeek: number[] }
  | { type: 'everyNDays'; n: number }
  | { type: 'biweekly'; weekday?: number }
  | { type: 'monthlyDay'; day: number }
  | { type: 'monthlyOrdinal'; ordinal: MonthlyOrdinal; weekday: WeekdayOrdinal }
  | { type: 'semiMonthly'; days: [number, number] }
  | { type: 'quarterly'; day: number }
  | { type: 'semiannual'; monthDays: SemiAnnual }
  | { type: 'annual'; month: number; day: number }
  | { type: 'customDays'; days: number[] };

export interface RecurrencePayload {
  recurrenceKind:     RecurrenceKind;
  simple?:            SimpleRecurrence;
  rrule?:             string;
  anchorDate?:        string;
  endDate?:           string;
  count?:             number;
  timezone?:          string;
  weekendAdjustment?: WeekendAdjustment;
  includeDates?:      string[];
  excludeDates?:      string[];
}
