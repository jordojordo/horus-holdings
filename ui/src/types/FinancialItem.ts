import type { RecurrenceKind, SimpleRecurrence, WeekendAdjustment } from './Recurrence';

export type FinanceItemKind = 'income' | 'expense';

export interface FinancialItem {
  id?:       string | number;
  name:      string;
  amount:    number;
  category?: string;

  // one-off date when recurrenceKind === 'none'
  date?: string;

  // recurrence (new model)
  recurrenceKind?:    RecurrenceKind;
  rrule?:             string;
  anchorDate?:        string;
  endDate?:           string;
  count?:             number;
  timezone?:          string;
  weekendAdjustment?: WeekendAdjustment;
  includeDates?:      string[];
  excludeDates?:      string[];

  // server-expanded occurrences within the requested window
  occurrences?: string[];

  // optional classification from server (overrides heuristic)
  isRecurring?: boolean;

  simple?: SimpleRecurrence | null;
}

export interface Income extends FinancialItem {
  kind: 'income';
}

export interface Expense extends FinancialItem {
  kind: 'expense';
}
