import type { FinancialItem } from './FinancialItem';

export interface Expense extends FinancialItem {
  kind: 'expense'
}
