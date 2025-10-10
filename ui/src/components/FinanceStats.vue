<script setup lang="ts">
type ChartData = {
  totalIncome?:            number;
  totalExpenses?:          number;
  netIncome?:              number;
  savingsRate?:            number;
  averageMonthlyIncome?:   number;
  averageMonthlyExpenses?: number;
  highestIncomeMonth?:     string;
  highestExpenseMonth?:    string;
};

defineProps<{ chartData: ChartData }>();

const fmtCurrency = (n?: number) => {
  if (n === undefined || n === null || Number.isNaN(n)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

const fmtPercent = (n?: number) => {
  if (n === undefined || n === null || Number.isNaN(n)) {
    return '—';
  }

  return `${ new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n)  }%`;
};
</script>

<template>
  <section
    class="finance-stats-grid"
    aria-label="Finance key metrics"
  >
    <!-- Row 1 -->
    <KCard class="kpi">
      <template #title>
        Total Income
      </template>
      <div class="kpi-value">
        {{ fmtCurrency(chartData.totalIncome) }}
      </div>
    </KCard>

    <KCard class="kpi">
      <template #title>
        Total Expenses
      </template>
      <div class="kpi-value">
        {{ fmtCurrency(chartData.totalExpenses) }}
      </div>
    </KCard>

    <KCard class="kpi">
      <template #title>
        Net Income
      </template>
      <div class="kpi-value">
        {{ fmtCurrency(chartData.netIncome) }}
      </div>
    </KCard>

    <KCard class="kpi">
      <template #title>
        Savings Rate
      </template>
      <div class="kpi-value">
        {{ fmtPercent(chartData.savingsRate) }}
      </div>
    </KCard>

    <!-- Row 2 -->
    <KCard class="kpi">
      <template #title>
        Avg Monthly Income
      </template>
      <div class="kpi-value">
        {{ fmtCurrency(chartData.averageMonthlyIncome) }}
      </div>
    </KCard>

    <KCard class="kpi">
      <template #title>
        Avg Monthly Expenses
      </template>
      <div class="kpi-value">
        {{ fmtCurrency(chartData.averageMonthlyExpenses) }}
      </div>
    </KCard>

    <KCard class="kpi">
      <template #title>
        Highest Income Month
      </template>
      <div class="kpi-value">
        {{ chartData.highestIncomeMonth ?? '—' }}
      </div>
    </KCard>

    <KCard class="kpi">
      <template #title>
        Highest Expense Month
      </template>
      <div class="kpi-value">
        {{ chartData.highestExpenseMonth ?? '—' }}
      </div>
    </KCard>
  </section>
</template>

<style scoped>
.finance-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--kui-space-60, 16px);
}

/* Breakpoints — adjust as you like */
@media (max-width: 1200px) {
  .finance-stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .finance-stats-grid {
    grid-template-columns: 1fr;
  }
}

.kpi .kpi-value {
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1.35;
  color: var(--kui-color-text, var(--foreground-primary));
}
</style>
