export interface Income {
  id: number;
  description: string;
  amount: number;
  date?: string | null;
  recurring?: boolean;
  recurrenceType?: string | null;
  recurrenceEndDate?: string | null;
}