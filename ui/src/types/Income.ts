import type { FinancialItem } from './FinancialItem';

export interface Income extends FinancialItem {
  kind: 'income'
}
