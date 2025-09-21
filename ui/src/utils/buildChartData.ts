import type { Dayjs } from 'dayjs';
import type { ChartData, Income, Expense, ItemBase } from '@/types';

import dayjs from 'dayjs';

import { expandOccurrencesFromItem } from './expandOccurrence';

const colorConfig = {
  inflow: {
    background: 'rgba(44, 182, 125, 0.4)',
    border:     'rgba(44, 182, 125, 1)',
  },
  outflow: {
    background: 'rgba(255, 127, 80, 0.4)',
    border:     'rgba(255, 127, 80, 1)',
  },
  forecast: {
    background: 'rgba(137, 101, 246, 0.4)',
    border:     'rgba(137, 101, 246, 1)',
  },
  net: {
    background: 'rgba(74, 144, 226, 0.4)',
    border:     'rgba(74, 144, 226, 1)',
  },
  recurringIncome: {
    background: 'rgba(44, 182, 125, 0.4)',
    border:     'rgba(44, 182, 125, 1)',
  },
  oneTimeIncome: {
    background: 'rgba(44, 182, 125, 0.2)',
    border:     'rgba(44, 182, 125, 0.6)',
  },
  recurringExpense: {
    background: 'rgba(255, 127, 80, 0.4)',
    border:     'rgba(255, 127, 80, 1)',
  },
  oneTimeExpense: {
    background: 'rgba(255, 127, 80, 0.2)',
    border:     'rgba(255, 127, 80, 0.6)',
  },
};

function emptyDayBuckets(start: Dayjs, end: Dayjs) {
  const m = new Map<string, number>();
  let d = start.startOf('day');

  while (d.isSame(end, 'day') || d.isBefore(end, 'day')) {
    m.set(d.format('YYYY-MM-DD'), 0);
    d = d.add(1, 'day');
  }

  return m;
}

function monthLabels(start: Dayjs, end: Dayjs): string[] {
  const labels: string[] = [];
  let d = start.startOf('month');

  while (d.isSame(end, 'month') || d.isBefore(end, 'month')) {
    labels.push(`${ d.format('MMM').toUpperCase() } ${ d.year() }`);
    d = d.add(1, 'month');
  }

  return labels;
}

function monthIndex(baseStart: Dayjs, dateISO: string): number {
  const d = dayjs(dateISO);

  return d.diff(baseStart.startOf('month'), 'month');
}

function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

function isRecurring(item: ItemBase): boolean {
  // Prefer explicit server flag if provided
  if (typeof item.isRecurring === 'boolean') {
    return item.isRecurring;
  }

  // Otherwise infer from recurrenceKind
  const kind = item.recurrenceKind ?? 'none';

  return kind !== 'none';
}

/**
 * Build all charts using server-expanded occurrences.
 * If occurrences are missing, we fallback to single `date` for one-offs.
 */
export function buildChartData(
  incomes: Income[],
  expenses: Expense[],
  rangeStartISO: string,
  rangeEndISO: string,
): ChartData {
  const start = dayjs(rangeStartISO);
  const end   = dayjs(rangeEndISO);

  const incomeOcc = new Map<ItemBase, string[]>();
  const expenseOcc = new Map<ItemBase, string[]>();

  // Cache occurrences so we don't expand the same item multiple times
  const getOcc = (map: Map<ItemBase, string[]>, it: ItemBase) => {
    let occ = map.get(it);

    console.log('# getOcc: ', occ);

    if (!occ) {
      occ = expandOccurrencesFromItem(it, rangeStartISO, rangeEndISO);

      // Fallback for one-offs if recurrence expansion yields nothing
      if ((!occ || !occ.length) && it.date) {
        occ = [dayjs(it.date).format('YYYY-MM-DD')];
      }

      map.set(it, occ || []);
    }

    return occ;
  };

  // 1) Daily buckets → net per day and running totals
  const dayBuckets = emptyDayBuckets(start, end);
  const addDaily = (iso: string, amt: number) => {
    if (iso >= rangeStartISO && iso <= rangeEndISO && dayBuckets.has(iso)) {
      dayBuckets.set(iso, (dayBuckets.get(iso) || 0) + amt);
    }
  };

  console.log('# buildChart incomes: ', incomes);

  incomes?.forEach((it) => getOcc(incomeOcc, it).forEach((d) => addDaily(d, +it.amount)));
  expenses?.forEach((it) => getOcc(expenseOcc, it).forEach((d) => addDaily(d, -Math.abs(+it.amount))));

  const dayLabels = Array.from(dayBuckets.keys()).sort();
  const dailyNet  = dayLabels.map((d) => dayBuckets.get(d) || 0);
  const running: number[] = [];

  dailyNet.reduce((acc, v, i) => (running[i] = acc + v, running[i]), 0);

  // 2) Monthly aggregations for bar/stacked
  const labels = monthLabels(start, end);
  const incomeMonthly = new Array(labels.length).fill(0);
  const expenseMonthly = new Array(labels.length).fill(0);
  const recurringIncomeMonthly = new Array(labels.length).fill(0);
  const oneTimeIncomeMonthly = new Array(labels.length).fill(0);
  const recurringExpenseMonthly = new Array(labels.length).fill(0);
  const oneTimeExpenseMonthly = new Array(labels.length).fill(0);

  const bump = (arr: number[], idx: number, amt: number) => {
    console.log(' bump: ', arr, idx, amt);
    if (idx >= 0 && idx < arr.length) {
      arr[idx] += amt;
    }
  };

  incomes.forEach((it) => {
    const occ = getOcc(incomeOcc, it);
    const recurring = isRecurring(it);
    const amt = Math.abs(+((it as any).amount));

    // console.log('income foreach, occ, recurring, amt', occ, recurring, amt);

    occ.forEach((iso) => {
      const idx = monthIndex(start, iso);

      bump(incomeMonthly, idx, amt);

      if (recurring) {
        bump(recurringIncomeMonthly, idx, amt);
      } else {
        bump(oneTimeIncomeMonthly, idx, amt);
      }
    });
  });

  expenses.forEach((it) => {
    const occ = getOcc(expenseOcc, it);
    const recurring = isRecurring(it);
    const amt = Math.abs(+((it as any).amount));

    occ.forEach((iso) => {
      const idx = monthIndex(start, iso);

      bump(expenseMonthly, idx, amt);

      if (recurring) {
        bump(recurringExpenseMonthly, idx, amt);
      } else {
        bump(oneTimeExpenseMonthly, idx, amt);
      }
    });
  });

  // console.log('# recurringIncomeMonthly: ', recurringIncomeMonthly)

  // 3) KPI calculations
  const totalIncome  = sum(incomeMonthly);
  const totalExpenses = sum(expenseMonthly);
  const netIncome = totalIncome - totalExpenses;

  const monthsCount = Math.max(1, labels.length);
  const averageMonthlyIncome = totalIncome / monthsCount;
  const averageMonthlyExpenses = totalExpenses / monthsCount;
  const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) : 0;

  const highestIncomeIdx = incomeMonthly.reduce((best, v, i) => v > incomeMonthly[best] ? i : best, 0);
  const highestExpenseIdx = expenseMonthly.reduce((best, v, i) => v > expenseMonthly[best] ? i : best, 0);
  const highestIncomeMonth = labels[highestIncomeIdx] || '';
  const highestExpenseMonth = labels[highestExpenseIdx] || '';

  // 4) First-half vs second-half comparison (by day range)
  const halfPoint = start.add(end.diff(start, 'day') / 2, 'day');
  let firstHalfIncome = 0, secondHalfIncome = 0, firstHalfExpenses = 0, secondHalfExpenses = 0;

  // console.log('incomeMonthly:', incomeMonthly);
  // console.log('expenseMonthly:', expenseMonthly);

  incomes.forEach((it) => {
    const amt = +((it as any).amount);

    getOcc(incomeOcc, it).forEach((d) => {
      if (dayjs(d).isSame(halfPoint, 'day') || dayjs(d).isBefore(halfPoint, 'day')) {
        (firstHalfIncome += amt);
      } else {
        (secondHalfIncome += amt);
      }
    });
  });

  expenses.forEach((it) => {
    const amt = Math.abs(+((it as any).amount));

    getOcc(expenseOcc, it).forEach((d) => {
      if (dayjs(d).isSame(halfPoint, 'day') || dayjs(d).isBefore(halfPoint, 'day')) {
        (firstHalfExpenses += amt);
      } else {
        (secondHalfExpenses += amt);
      }
    });
  });

  // 5) Assemble charts
  const barData = {
    labels,
    datasets: [
      {
        label:           'Cash Inflow',
        backgroundColor: colorConfig.inflow.background,
        borderColor:     colorConfig.inflow.border,
        borderWidth:     2,
        data:            incomeMonthly,
      },
      {
        label:           'Cash Outflow',
        backgroundColor: colorConfig.outflow.background,
        borderColor:     colorConfig.outflow.border,
        borderWidth:     2,
        data:            expenseMonthly,
      },
    ],
  };

  const lineData = {
    labels:   dayLabels,
    datasets: [
      {
        label:           'Running Net',
        backgroundColor: colorConfig.net.background,
        borderColor:     colorConfig.net.border,
        borderWidth:     2,
        data:            running,
        // fill:            true,
        tension:         0.25,
      },
    ],
  };

  const stackedBarData = {
    labels,
    datasets: [
      {
        label:           'Recurring Income',
        backgroundColor: colorConfig.recurringIncome.background,
        borderColor:     colorConfig.recurringIncome.border,
        borderWidth:     2,
        data:            recurringIncomeMonthly,
      },
      {
        label:           'One-Time Income',
        backgroundColor: colorConfig.oneTimeIncome.background,
        borderColor:     colorConfig.oneTimeIncome.border,
        borderWidth:     2,
        data:            oneTimeIncomeMonthly,
      },
      {
        label:           'Recurring Expense',
        backgroundColor: colorConfig.recurringExpense.background,
        borderColor:     colorConfig.recurringExpense.border,
        borderWidth:     2,
        data:            recurringExpenseMonthly,
      },
      {
        label:           'One-Time Expense',
        backgroundColor: colorConfig.oneTimeExpense.background,
        borderColor:     colorConfig.oneTimeExpense.border,
        borderWidth:     2,
        data:            oneTimeExpenseMonthly,
      },
    ],
  };

  const pieData = {
    labels:   ['Total Income', 'Total Expenses'],
    datasets: [{
      label:           'Budget Overview',
      backgroundColor: [
        colorConfig.inflow.background,
        colorConfig.outflow.background,
      ],
      data: [totalIncome, totalExpenses],
    }],
  };

  const donutData = {
    labels:   ['Recurring Income', 'One-Time Income', 'Recurring Expense', 'One-Time Expense'],
    datasets: [{
      label:           'Transaction Breakdown',
      backgroundColor: [
        colorConfig.recurringIncome.background,
        colorConfig.oneTimeIncome.background,
        colorConfig.recurringExpense.background,
        colorConfig.oneTimeExpense.background,
      ],
      data: [
        sum(recurringIncomeMonthly),
        sum(oneTimeIncomeMonthly),
        sum(recurringExpenseMonthly),
        sum(oneTimeExpenseMonthly),
      ],
    }],
  };

  const comparisonData = {
    labels:   ['Income', 'Expenses'],
    datasets: [
      {
        label:           'First Half of Selected Period',
        data:            [firstHalfIncome, firstHalfExpenses],
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      },
      {
        label:           'Second Half of Selected Period',
        data:            [secondHalfIncome, secondHalfExpenses],
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      },
    ],
  };

  return {
    labels,
    barData,
    lineData,
    stackedBarData,
    pieData,
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
}
