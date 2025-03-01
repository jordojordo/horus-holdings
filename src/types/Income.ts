export interface Income {
  id: number;
  description: string;
  amount: number;
  category?: string;
  date?: string | null;
  recurring?: boolean;
  recurrenceType?: string | null;
  recurrenceEndDate?: string | null;
}
