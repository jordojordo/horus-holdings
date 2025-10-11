import type { Income, Expense } from '@/types';

export type ItemBase = Income | Expense;

export interface ChartData {
  labels:  string[];
  barData: {
    labels:   string[];
    datasets: {
      label:           string;
      backgroundColor: string;
      borderColor?:    string;
      borderWidth?:    number;
      data:            number[];
    }[];
  };
  lineData: {
    labels:   string[];
    datasets: {
      label:           string;
      backgroundColor: string;
      borderColor?:    string;
      borderWidth?:    number;
      data:            number[];
      // fill: boolean;
      tension:         number;
    }[];
  };
  pieData: {
    labels:   string[];
    datasets: {
      label:           string;
      backgroundColor: string[];
      data:            number[];
    }[];
  };
  stackedBarData: {
    labels:   string[];
    datasets: {
      label:           string;
      backgroundColor: string;
      borderColor:     string;
      borderWidth:     number;
      data:            number[];
    }[];
  };
  donutData: {
    labels:   string[];
    datasets: {
      label:           string;
      backgroundColor: string[];
      data:            number[];
    }[];
  };
  comparisonData: {
    labels:   string[];
    datasets: {
      label:           string;
      data:            number[];
      backgroundColor: string;
    }[];
  };
  totalIncome:            number;
  totalExpenses:          number;
  netIncome:              number;
  averageMonthlyIncome:   number;
  averageMonthlyExpenses: number;
  savingsRate:            number;
  highestIncomeMonth:     string;
  highestExpenseMonth:    string;
}