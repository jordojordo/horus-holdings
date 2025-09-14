import type { Dayjs } from 'dayjs';

export interface Income {
  id?: number;
  description: string;
  amount: number;
  category?: string | null;
  date?: Dayjs | string | null;
  recurring?: boolean;
  recurrenceType?: string | null;
  recurrenceEndDate?: Dayjs | string | null;
  customRecurrenceDays?: number[]; // e.g. [1, 15] for the 1st and 15th of the month
}
