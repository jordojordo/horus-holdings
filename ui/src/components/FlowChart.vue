<script setup lang="ts">
import type { FinanceMode } from '@/types';

import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';
import { Filler } from 'chart.js';
import { useRoute, useRouter } from 'vue-router';

import '@/utils/chartConfig';
import { timePeriods } from '@/config/DateRangePeriods';
import { useFinancialData } from '@/composables/useFinancialData';
import { buildChartData } from '@/utils/buildChartData';
import { useThemeStore } from '@/stores/theme';

import FinanceStats from '@/components/FinanceStats.vue';
import CashFlowCharts from '@/components/CashFlowCharts.vue';

type TimeframeModel = {
  start:           Date | null;
  end:             Date | null;
  timePeriodsKey?: string;
};

const themeStore = useThemeStore();
const today = dayjs();
const route = useRoute();
const router = useRouter();

const timeframe = ref<TimeframeModel>({
  start:          period('last30d', '', '', 30).start(),
  end:            period('last30d', '', '', 30).end(),
  timePeriodsKey: 'last30d',
});
const mode = ref<FinanceMode>((route.query.mode as FinanceMode) ?? 'combined');

const startRef = computed(() => timeframe.value.start);
const endRef = computed(() => timeframe.value.end);

const rangeStartISO = computed<string | undefined>(() =>
  startRef.value ? dayjs(startRef.value).format('YYYY-MM-DD') : today.startOf('month').format('YYYY-MM-DD')
);
const rangeEndISO = computed<string | undefined>(() =>
  endRef.value ? dayjs(endRef.value).format('YYYY-MM-DD') : today.endOf('month').format('YYYY-MM-DD')
);

const { isLoading, incomes, expenses } = useFinancialData({
  rangeStartISO: rangeStartISO,
  rangeEndISO:   rangeEndISO,
});

const chartData = computed(() => {
  return buildChartData(
    incomes.value ?? [],
    expenses.value ?? [],
    rangeStartISO.value ?? '',
    rangeEndISO.value ?? '',
    { mode: mode.value }
  );
});

const chartOptions = {
  responsive:          true,
  maintainAspectRatio: false,
  plugins:             { ...Filler },
};

function period(
  key: string,
  display: string,
  timeframeText: string,
  days: number
) {
  return {
    key,
    display,
    timeframeText,
    timeframeLength: () => `${ days }d`,
    start:           () => {
      const d = new Date();

      d.setDate(d.getDate() - days);

      return d;
    },
    end: () => new Date(),
  };
}

function onRangeChange(next: TimeframeModel) {
  if (next) {
    timeframe.value = next;
  }
}

watch(mode, m => {
  router.replace({ query: { ...route.query, mode: m } });
});
</script>

<template>
  <div class="flow-chart-container">
    <div class="toolbar mb-10">
      <div class="mode-wrapper">
        <KLabel
          for="mode"
          info="Choose the mode to show recurring (Actual), non-recurring (Projected), or combined finances"
          :tooltip-attributes="{ placement: 'top' }"
        >
          Mode
        </KLabel>
        <KSegmentedControl
          id="mode"
          v-model="mode"
          :options="[
            { label: 'Combined', value: 'combined' },
            { label: 'Actual', value: 'actual' },
            { label: 'Projected', value: 'projected' }
          ]"
          inline
          size="large"
        />
      </div>

      <div class="date-range-wrapper">
        <KLabel
          for="dateRange"
          info="Choose a relative or custom date range"
          :tooltip-attributes="{ placement: 'top' }"
        >
          Date range
        </KLabel>
        <KDateTimePicker
          id="dateRange"
          v-model="timeframe"
          mode="relativeDate"
          :range="true"
          :time-periods="timePeriods"
          placeholder="Select a time range"
          icon
          popover-placement="bottom-start"
          :style="themeStore.isDark ? { '--kui-color-background-primary-weakest': 'var(--purple-lighter)' } : {}"
          @change="(value: (TimeframeModel | null)) => onRangeChange(value as TimeframeModel)"
        />
      </div>
    </div>

    <KEmptyState
      v-if="!isLoading && !incomes.length && !expenses.length"
      title="No data available"
      message="No financial data available for the selected date range."
    />

    <template v-else>
      <FinanceStats
        class="mb-10"
        :chart-data="chartData"
      />
      <CashFlowCharts
        :chart-data="chartData"
        :options="chartOptions"
      />
    </template>
  </div>
</template>


<style scoped>
:deep(.datetime-picker-display) {
  padding-top: .15rem;
}

.flow-chart-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.date-range-wrapper, .mode-wrapper {
  width: fit-content;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.pie,
.donut {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
}

.line,
.bar,
.stacked-bar,
.comparison-chart {
  width: 100%;
}

@media (max-width: 725px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }

  .pie,
  .donut {
    max-width: 100%;
  }
}

@media (max-width: 500px) {
  .date-range-wrapper, .mode-wrapper {
    width: 100%;
  }
}
</style>
