import type { RecurrenceKind, SimpleRecurrence, WeekendAdjustment } from './Recurrence';

export interface FinancialItem {
  id: string | number;
  description: string;
  amount: number;
  category?: string | null;

  // one-off date when recurrenceKind === 'none'
  date?: string | null;

  // recurrence (new model)
  recurrenceKind?: RecurrenceKind;
  rrule?: string | null;
  anchorDate?: string | null;
  endDate?: string | null;
  count?: number | null;
  timezone?: string | null;
  weekendAdjustment?: WeekendAdjustment;
  includeDates?: string[];
  excludeDates?: string[];

  // server-expanded occurrences within the requested window
  occurrences?: string[];

  // optional classification from server (overrides heuristic)
  isRecurring?: boolean;
}

export type ItemForExpand = {
  // one-off / legacy
  date?: string | null;

  // recurrence
  recurrenceKind?: RecurrenceKind;
  // advanced
  rrule?: string | null;
  // simple
  simple?: SimpleRecurrence;

  anchorDate?: string | null;
  endDate?: string | null;
  count?: number | null;

  // tz is treated as “floating” on UI; the server is the source of truth for tz-sensitive runs
  timezone?: string | null;

  weekendAdjustment?: WeekendAdjustment;
  includeDates?: string[];
  excludeDates?: string[];
};