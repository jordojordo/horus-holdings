<script setup lang="ts">
import type { ChartData } from '@/types'

import { computed, nextTick, ref, watch } from 'vue'
import { InfoIcon } from '@kong/icons'

import '@/utils/chartConfig'
import { useThemeStore } from '@/stores/theme'

import { Bar, Line, Pie, Doughnut } from 'vue-chartjs'

const props = defineProps<{
  chartData: ChartData
  options?: any
}>()

const themeStore = useThemeStore()

const renderKey = ref(0)

const mode = computed(() => themeStore.theme);
const options = computed(() => props.options ?? { responsive: true, maintainAspectRatio: false })

const stackedOptions = computed(() => ({
  ...options.value,
  scales: {
    x: { stacked: true },
    y: { stacked: true },
  },
}))

const comparisonOptions = computed(() => optionsWithTitle('First Half vs. Second Half'))

const pieLikeOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1,
  resizeDelay: 120,
  devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
  plugins: {
    ...(options.value?.plugins),
    legend: { display: true, position: 'bottom' },
  },
}))

function optionsWithTitle(title: string) {
  return {
    ...options.value,
    plugins: {
      ...(options.value?.plugins),
      title: { display: true, text: title },
    },
  }
}

watch(mode, async () => {
  renderKey.value++
  await nextTick()
})
</script>

<template>
  <!-- Line -->
  <div class="chart-block">
    <div class="chart-title">
      <h3>Running Net</h3>
      <KTooltip text="Line chart shows cumulative running net across the selected days.">
        <InfoIcon />
      </KTooltip>
    </div>
    <div class="line mb-5">
      <Line :key="`line-${ renderKey }`" :data="chartData.lineData" :options="options" />
    </div>
  </div>

  <!-- Bar -->
  <div class="chart-block">
    <div class="chart-title">
      <h3>Monthly Cashflow</h3>
      <KTooltip text="This bar chart compares monthly cash inflows and outflows.">
        <InfoIcon />
      </KTooltip>
    </div>
    <div class="bar mb-5">
      <Bar :key="`bar-1-${ renderKey }`" :data="chartData.barData" :options="optionsWithTitle('Monthly Cash Inflow vs. Outflow')" />
    </div>
  </div>

  <!-- Stacked -->
  <div class="chart-block">
    <div class="chart-title">
      <h3>Income & Expenses Breakdown</h3>
      <KTooltip text="Stacked bars split each month into recurring vs one-time for incomes and expenses.">
        <InfoIcon />
      </KTooltip>
    </div>
    <div class="bar mb-5">
      <Bar :key="`bar-2-${ renderKey }`" :data="chartData.stackedBarData" :options="stackedOptions" />
    </div>
  </div>

  <!-- Pie / Doughnut -->
  <div class="chart-block pies">
    <div class="chart-title">
      <h3>Totals (Pie & Donut)</h3>
      <KTooltip text="Totals across selected period."><InfoIcon /></KTooltip>
    </div>

    <div class="pie-charts">
      <div class="chart-square">
        <Pie :key="`pie-${ renderKey }`" :data="chartData.pieData" :options="pieLikeOptions" />
      </div>
      <div class="chart-square">
        <Doughnut :key="`doughnut-${ renderKey }`" :data="chartData.donutData" :options="pieLikeOptions" />
      </div>
    </div>
  </div>

  <!-- Comparison -->
  <div class="chart-block">
    <div class="chart-title">
      <h3>First Half vs Second Half</h3>
      <KTooltip text="Compares totals between the first and second halves of the window.">
        <InfoIcon />
      </KTooltip>
    </div>
    <div class="comparison-chart">
      <Bar :key="`bar-3-${ renderKey }`" :data="chartData.comparisonData" :options="comparisonOptions" />
    </div>
  </div>
</template>

<style scoped>
.chart-title {
  display: flex;
  gap: 10px;
}

.pie-charts {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: space-around;
}

.chart-square {
  position: relative;
  flex: 1 1 0;
  min-width: 240px;
  max-width: 400px;
  aspect-ratio: 1 / 1;
}

/* Let Chart.js fill the box; avoid intrinsic content-based growth */
.chart-square canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.chart-block {
  margin-bottom: 2rem;
}
</style>
