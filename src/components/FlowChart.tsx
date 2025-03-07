import React, { useState, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import '@/utils/chartConfig';
import DateRange from '@/components/DateRange';
import IncomeExpenseStats from '@/components/IncomeExpenseStats';
import CashFlowCharts from '@/components/CashFlowCharts';
import { useFinancialData } from '@/hooks/useFinancialData';
import { processChartData, ChartData } from '@/utils/processChartData';

import '@/assets/style/FlowChart.css';

const FlowChart: React.FC = () => {
  const { incomes, expenses } = useFinancialData();

  const today = dayjs();
  const oneMonthAgo = dayjs().subtract(1, 'month');

  const [startDate, setStartDate] = useState<Dayjs>(oneMonthAgo);
  const [endDate, setEndDate] = useState<Dayjs>(today);

  const chartData: ChartData = useMemo(
    () => processChartData(incomes, expenses, startDate, endDate),
    [incomes, expenses, startDate, endDate]
  );

  const options = {
    responsive: true,
    plugins:    { legend: { position: 'top' as const } },
  };

  const handleDateRangeChange = (start: Dayjs, end: Dayjs) => {
    setStartDate(start);
    setEndDate(end);
  };

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
