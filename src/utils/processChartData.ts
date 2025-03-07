import dayjs, { Dayjs, ManipulateType } from 'dayjs';

import { Income } from '@/types/Income';
import { Expense } from '@/types/Expense';

export interface ChartData {
  labels: string[];
  barData: {
    labels: string[];
    datasets: {
      label: string;
      backgroundColor: string;
      borderColor?: string;
      borderWidth?: number;
      data: number[];
    }[];
  };
  lineData: {
    labels: string[];
    datasets: {
      label: string;
      backgroundColor: string;
      borderColor?: string;
      borderWidth?: number;
      data: number[];
      fill: boolean;
      tension: number;
    }[];
  };
  pieData: {
    labels: string[];
    datasets: {
      label: string;
      backgroundColor: string[];
      data: number[];
    }[];
  };
  stackedBarData: {
    labels: string[];
    datasets: {
      label: string;
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      data: number[];
    }[];
  },
  donutData: {
    labels: string[];
    datasets: {
      label: string;
      backgroundColor: string[];
      data: number[];
    }[];
  },
  comparisonData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  },
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  savingsRate: number;
  highestIncomeMonth: string;
  highestExpenseMonth: string;
}

export type RecurrenceType = 'bi-weekly' | 'monthly' | 'bi-monthly' | 'custom';

const addRecurringAmount = (
  amount: number,
  entryStartDate: Dayjs,
  recurrenceType: string,
  recurrenceEndDate: Dayjs | undefined,
  startDate: Dayjs,
  endDate: Dayjs,
  data: number[],
  customRecurrenceDays?: number[]
) => {
  // If the recurrence type is "custom" and custom days are provided,
  // then for each month between startDate and endDate, add the amount on the specified days.
  if (recurrenceType === 'custom' && customRecurrenceDays && customRecurrenceDays.length > 0) {
    let currentMonth = startDate.startOf('month');


    while (currentMonth <= endDate) {
      customRecurrenceDays.forEach((dayOfMonth) => {
        // Create a date for this month with the specified day.
        // dayjs will adjust if the day is out of range (e.g., Feb 30 becomes Mar 2),
        const recurrenceDate = currentMonth.date(dayOfMonth);

        // Check if this recurrence date is within our overall range
        if (
          (recurrenceDate.isSame(startDate) || recurrenceDate.isAfter(startDate)) &&
          (recurrenceDate.isSame(recurrenceEndDate || endDate) || recurrenceDate.isBefore(recurrenceEndDate || endDate))
        ) {
          const monthIndex = recurrenceDate.diff(startDate.startOf('month'), 'month');

          if (monthIndex >= 0 && monthIndex < data.length) {
            data[monthIndex] += amount;
          }
        }
      });
      currentMonth = currentMonth.add(1, 'month');
    }

    return;
  }

  // Otherwise, use fixed intervals. You can remove or modify these as needed.
  const recurrenceIntervals: { [key in RecurrenceType]: { value: number; unit: ManipulateType } } = {
    'bi-weekly':  {
      value: 14,
      unit:  'day'
    },
    monthly:      {
      value: 1,
      unit:  'month'
    },
    'bi-monthly': {
      value: 2,
      unit:  'month'
    },
    custom: {
      value: 1,
      unit:  'month'
    }
  };

  const recurrenceInterval = recurrenceIntervals[recurrenceType as RecurrenceType];

  if (!recurrenceInterval) {
    return;
  }

  let date = entryStartDate.clone();
  const effectiveEndDate = recurrenceEndDate || endDate;

  while (date <= effectiveEndDate) {
    if (
      (date.isSame(startDate) || date.isAfter(startDate)) &&
      (date.isSame(effectiveEndDate) || date.isBefore(effectiveEndDate))
    ) {
      const monthIndex = date.diff(startDate.startOf('month'), 'month');

      if (monthIndex >= 0 && monthIndex < data.length) {
        data[monthIndex] += amount;
      }
    }
    date = date.add(recurrenceInterval.value, recurrenceInterval.unit);
  }
};

export const processChartData = (
  incomes: Income[],
  expenses: Expense[],
  startDate: Dayjs,
  endDate: Dayjs
): ChartData => {
  const labels: string[] = [];
  let date = startDate.clone();

  while (date <= endDate) {
    labels.push(`${ date.format('MMM').toUpperCase() } ${ date.year() }`);
    date = date.add(1, 'month');
  }

  // Initialize arrays for monthly totals
  const incomeData = new Array(labels.length).fill(0);
  const expenseData = new Array(labels.length).fill(0);

  // Initialize arrays for recurring vs one-time breakdown (for stacked chart)
  const recurringIncomeData = new Array(labels.length).fill(0);
  const oneTimeIncomeData = new Array(labels.length).fill(0);
  const recurringExpenseData = new Array(labels.length).fill(0);
  const oneTimeExpenseData = new Array(labels.length).fill(0);

  // Process incomes
  incomes.forEach((income) => {
    const incomeStartDate = income.date ? dayjs(income.date) : startDate;

    if (income.recurring && income.recurrenceType) {
      // Add to overall monthly income totals
      addRecurringAmount(
        income.amount,
        incomeStartDate,
        income.recurrenceType,
        income.recurrenceEndDate ? dayjs(income.recurrenceEndDate) : undefined,
        startDate,
        endDate,
        incomeData,
        income.customRecurrenceDays
      );
      // Also add to recurring income breakdown
      addRecurringAmount(
        income.amount,
        incomeStartDate,
        income.recurrenceType,
        income.recurrenceEndDate ? dayjs(income.recurrenceEndDate) : undefined,
        startDate,
        endDate,
        recurringIncomeData,
        income.customRecurrenceDays
      );
    } else if (income.date) {
      const incomeDate = dayjs(income.date);

      if (incomeDate >= startDate && incomeDate <= endDate) {
        const monthIndex = incomeDate.diff(startDate.startOf('month'), 'month');

        incomeData[monthIndex] += income.amount;
        oneTimeIncomeData[monthIndex] += income.amount;
      }
    }
  });

  // Process expenses
  expenses.forEach((expense) => {
    const expenseStartDate = expense.date ? dayjs(expense.date) : startDate;

    if (expense.recurring && expense.recurrenceType) {
      addRecurringAmount(
        expense.amount,
        expenseStartDate,
        expense.recurrenceType,
        expense.recurrenceEndDate ? dayjs(expense.recurrenceEndDate) : undefined,
        startDate,
        endDate,
        expenseData,
        expense.customRecurrenceDays
      );
      addRecurringAmount(
        expense.amount,
        expenseStartDate,
        expense.recurrenceType,
        expense.recurrenceEndDate ? dayjs(expense.recurrenceEndDate) : undefined,
        startDate,
        endDate,
        recurringExpenseData,
        expense.customRecurrenceDays
      );
    } else if (expense.date) {
      const expenseDate = dayjs(expense.date);

      if (expenseDate >= startDate && expenseDate <= endDate) {
        const monthIndex = expenseDate.diff(startDate.startOf('month'), 'month');

        expenseData[monthIndex] += expense.amount;
        oneTimeExpenseData[monthIndex] += expense.amount;
      }
    }
  });

  // Cumulative cash flow for the line chart
  const netCashFlowData = incomeData.map((inc, index) => inc - expenseData[index]);
  let cumulativeSum = 0;
  const cumulativeCashFlowData = netCashFlowData.map((val) => {
    cumulativeSum += val;

    return cumulativeSum;
  });

  // Basic summary stats
  const totalIncome = incomeData.reduce((sum, val) => sum + val, 0);
  const totalExpenses = expenseData.reduce((sum, val) => sum + val, 0);
  const netIncome = totalIncome - totalExpenses;
  const numberOfMonths = labels.length;
  const averageMonthlyIncome = totalIncome / numberOfMonths;
  const averageMonthlyExpenses = totalExpenses / numberOfMonths;
  const savingsRate = totalIncome !== 0 ? (netIncome / totalIncome) * 100 : 0;
  const highestIncome = Math.max(...incomeData);
  const highestExpense = Math.max(...expenseData);
  const highestIncomeMonth = labels[incomeData.indexOf(highestIncome)];
  const highestExpenseMonth = labels[expenseData.indexOf(highestExpense)];

  // Color configuration
  const colorConfig = {
    inflow:           {
      background: 'rgba(44, 182, 125, 0.4)',
      border:     'rgba(44, 182, 125, 1)'
    },
    outflow:          {
      background: 'rgba(255, 127, 80, 0.4)',
      border:     'rgba(255, 127, 80, 1)'
    },
    forecast:         {
      background: 'rgba(137, 101, 246, 0.4)',
      border:     'rgba(137, 101, 246, 1)'
    },
    net:              {
      background: 'rgba(74, 144, 226, 0.4)',
      border:     'rgba(74, 144, 226, 1)'
    },
    recurringIncome:  {
      background: 'rgba(44, 182, 125, 0.4)',
      border:     'rgba(44, 182, 125, 1)'
    },
    oneTimeIncome:    {
      background: 'rgba(44, 182, 125, 0.2)',
      border:     'rgba(44, 182, 125, 0.6)'
    },
    recurringExpense: {
      background: 'rgba(255, 127, 80, 0.4)',
      border:     'rgba(255, 127, 80, 1)'
    },
    oneTimeExpense:   {
      background: 'rgba(255, 127, 80, 0.2)',
      border:     'rgba(255, 127, 80, 0.6)'
    },
  };

  // Stacked bar chart data (monthly recurring vs one-time breakdown)
  const stackedBarData = {
    labels,
    datasets: [
      {
        label:           'Recurring Income',
        backgroundColor: colorConfig.recurringIncome.background,
        borderColor:     colorConfig.recurringIncome.border,
        borderWidth:     2,
        data:            recurringIncomeData,
      },
      {
        label:           'One-Time Income',
        backgroundColor: colorConfig.oneTimeIncome.background,
        borderColor:     colorConfig.oneTimeIncome.border,
        borderWidth:     2,
        data:            oneTimeIncomeData,
      },
      {
        label:           'Recurring Expense',
        backgroundColor: colorConfig.recurringExpense.background,
        borderColor:     colorConfig.recurringExpense.border,
        borderWidth:     2,
        data:            recurringExpenseData,
      },
      {
        label:           'One-Time Expense',
        backgroundColor: colorConfig.oneTimeExpense.background,
        borderColor:     colorConfig.oneTimeExpense.border,
        borderWidth:     2,
        data:            oneTimeExpenseData,
      },
    ],
  };

  // Donut chart data: breakdown of total recurring vs one-time amounts
  const totalRecurringIncome = recurringIncomeData.reduce((sum, v) => sum + v, 0);
  const totalOneTimeIncome = oneTimeIncomeData.reduce((sum, v) => sum + v, 0);
  const totalRecurringExpense = recurringExpenseData.reduce((sum, v) => sum + v, 0);
  const totalOneTimeExpense = oneTimeExpenseData.reduce((sum, v) => sum + v, 0);

  const donutData = {
    labels:   ['Recurring Income', 'One-Time Income', 'Recurring Expense', 'One-Time Expense'],
    datasets: [
      {
        label:           'Transaction Breakdown',
        backgroundColor: [
          colorConfig.recurringIncome.background,
          colorConfig.oneTimeIncome.background,
          colorConfig.recurringExpense.background,
          colorConfig.oneTimeExpense.background,
        ],
        data: [totalRecurringIncome, totalOneTimeIncome, totalRecurringExpense, totalOneTimeExpense],
      },
    ],
  };

  // Comparison data: totals for first half vs second half of the period
  const halfIndex = Math.floor(labels.length / 2);
  const firstHalfIncome = incomeData.slice(0, halfIndex).reduce((sum, v) => sum + v, 0);
  const firstHalfExpenses = expenseData.slice(0, halfIndex).reduce((sum, v) => sum + v, 0);
  const secondHalfIncome = incomeData.slice(halfIndex).reduce((sum, v) => sum + v, 0);
  const secondHalfExpenses = expenseData.slice(halfIndex).reduce((sum, v) => sum + v, 0);

  const comparisonData = {
    labels:   ['Income', 'Expenses'],
    datasets: [
      {
        label:           'First Half of Selected Period',
        data:            [firstHalfIncome, firstHalfExpenses],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label:           'Second Half of Selected Period',
        data:            [secondHalfIncome, secondHalfExpenses],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  return {
    labels,
    barData: {
      labels,
      datasets: [
        {
          label:           'Cash Inflow',
          backgroundColor: colorConfig.inflow.background,
          borderColor:     colorConfig.inflow.border,
          borderWidth:     2,
          data:            incomeData,
        },
        {
          label:           'Cash Outflow',
          backgroundColor: colorConfig.outflow.background,
          borderColor:     colorConfig.outflow.border,
          borderWidth:     2,
          data:            expenseData,
        },
      ],
    },
    lineData: {
      labels,
      datasets: [
        {
          label:           'Net Cash Flow',
          backgroundColor: colorConfig.net.background,
          borderColor:     colorConfig.net.border,
          data:            netCashFlowData,
          fill:            false,
          tension:         0.1,
        },
        {
          label:           'Forecast',
          backgroundColor: colorConfig.forecast.background,
          borderColor:     colorConfig.forecast.border,
          data:            cumulativeCashFlowData,
          fill:            false,
          tension:         0.1,
        },
      ],
    },
    pieData: {
      labels:   ['Total Income', 'Total Expenses'],
      datasets: [
        {
          label:           'Budget Overview',
          backgroundColor: [
            colorConfig.inflow.background,
            colorConfig.outflow.background,
          ],
          data: [totalIncome, totalExpenses],
        },
      ],
    },
    stackedBarData,
    donutData,
    comparisonData,
    totalIncome,
    totalExpenses,
    netIncome,
    averageMonthlyIncome,
    averageMonthlyExpenses,
    savingsRate,
    highestIncomeMonth,
    highestExpenseMonth,
  };
};

