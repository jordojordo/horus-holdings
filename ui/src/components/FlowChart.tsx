import type { Dayjs } from 'dayjs';
import type { ChartData } from '@/types';

import React, { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { Filler } from 'chart.js';

import '@/utils/chartConfig';
import { useFinancialData } from '@/hooks/useFinancialData';
import { buildChartData } from '@/utils/buildChartData';

import DateRange from '@/components/DateRange';
import IncomeExpenseStats from '@/components/IncomeExpenseStats';
import CashFlowCharts from '@/components/CashFlowCharts';

import '@/assets/style/FlowChart.css';

const FlowChart: React.FC = () => {
  const today = dayjs();
  const defaultStart = today.startOf('month');
  const defaultEnd = today.endOf('month');

  const [startDate, setStartDate] = useState<Dayjs>(defaultStart);
  const [endDate, setEndDate] = useState<Dayjs>(defaultEnd);

  const { incomes, expenses } = useFinancialData({
    rangeStartISO: startDate.format('YYYY-MM-DD'),
    rangeEndISO:   endDate.format('YYYY-MM-DD'),
  });

  const chartData: ChartData = useMemo(() => {
    return buildChartData(
      incomes ?? [],
      expenses ?? [],
      startDate.format('YYYY-MM-DD'),
      endDate.format('YYYY-MM-DD')
    );
  }, [incomes, expenses, startDate, endDate]);

  const options = useMemo(
    () => ({
      responsive:          true,
      maintainAspectRatio: false,
      plugins:             { ...Filler }
    }),
    []
  );

  const handleDateRangeChange = useCallback((start: Dayjs, end: Dayjs) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  return (
    <div className="flow-chart-container">
      <div className="mb-10">
        <DateRange
          initialStartDate={startDate}
          initialEndDate={endDate}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>
      <IncomeExpenseStats chartData={chartData} />
      <CashFlowCharts chartData={chartData} options={options} />
    </div>
  );
};

export default FlowChart;
