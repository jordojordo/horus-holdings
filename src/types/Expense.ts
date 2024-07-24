export interface Expense {
  id: number;
  description: string;
  amount: number;
  category?: string;
  date?: string;
  recurring?: boolean;
  recurrenceType?: string | null;
  recurrenceEndDate?: string | null;
}