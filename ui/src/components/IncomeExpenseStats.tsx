import type { ChartData } from '@/types';

import React from 'react';
import { Col, Row, Statistic } from 'antd';

interface IncomeExpenseStatsProps {
  chartData: ChartData;
}

const IncomeExpenseStats: React.FC<IncomeExpenseStatsProps> = ({ chartData }) => {
  const {
    totalIncome,
    totalExpenses,
    netIncome,
    averageMonthlyIncome,
    averageMonthlyExpenses,
    savingsRate,
    highestIncomeMonth,
    highestExpenseMonth,
  } = chartData;

  return (
    <>
      <Row gutter={16} className="mb-10">
        <Col span={6}>
          <Statistic title="Total Income" value={totalIncome} precision={2} />
        </Col>
        <Col span={6}>
          <Statistic title="Total Expenses" value={totalExpenses} precision={2} />
        </Col>
        <Col span={6}>
          <Statistic title="Net Income" value={netIncome} precision={2} />
        </Col>
        <Col span={6}>
          <Statistic title="Savings Rate" value={savingsRate} precision={2} suffix="%" />
        </Col>
      </Row>
      <Row gutter={16} className="mb-10">
        <Col span={6}>
          <Statistic title="Avg Monthly Income" value={averageMonthlyIncome} precision={2} />
        </Col>
        <Col span={6}>
          <Statistic title="Avg Monthly Expenses" value={averageMonthlyExpenses} precision={2} />
        </Col>
        <Col span={6}>
          <Statistic title="Highest Income Month" value={highestIncomeMonth} />
        </Col>
        <Col span={6}>
          <Statistic title="Highest Expense Month" value={highestExpenseMonth} />
        </Col>
      </Row>
    </>
  );
};

export default IncomeExpenseStats;
