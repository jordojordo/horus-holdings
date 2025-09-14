import React from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

import type { ChartData } from '@/utils/processChartData';

import '@/assets/style/CashFlowCharts.css';

interface CashFlowChartsProps {
  chartData: ChartData;
  options: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const CashFlowCharts: React.FC<CashFlowChartsProps> = ({
  chartData,
  options,
}) => {
  // Options for the stacked bar chart
  const stackedOptions = {
    ...options,
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
    plugins: {
      ...options.plugins,
      title: {
        display: true,
        text:    'Recurring vs. One-Time Income & Expenses',
      },
    },
  };

  // Custom options for the comparison chart with a title
  const comparisonOptions = {
    ...options,
    plugins: {
      ...options.plugins,
      title: {
        display: true,
        text:    'Income & Expenses Comparison: First vs. Second Half of Selected Period',
      },
      tooltip: {
        callbacks: {
          label: (context: {
            dataset: { label: string };
            parsed: { y: string };
          }) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;

            return `${ label }: ${ value }`;
          },
        },
      },
    },
  };

  return (
    <>
      {/* Budget Overview Section */}
      <div className="chart-block">
        <div className="chart-title">
          <h3>Budget Overview</h3>
          <Tooltip title="This section shows the overall distribution between Total Income and Total Expenses.">
            <InfoCircleOutlined />
          </Tooltip>
        </div>

        <div className="chart-grid">
          <div className="pie">
            <Pie
              data={chartData.pieData}
              options={{
                ...options,
                plugins: {
                  ...options.plugins,
                  title: {
                    display: true,
                    text:    'Total Income vs. Total Expenses',
                  },
                },
              }}
            />
          </div>
          <div className="donut">
            <Doughnut
              data={chartData.donutData}
              options={{
                ...options,
                plugins: {
                  ...options.plugins,
                  title: {
                    display: true,
                    text:    'Transaction Breakdown: Recurring vs. One-Time',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Net Cash Flow Section */}
      <div className="chart-block">
        <div className="chart-title">
          <h3>Net Cash Flow Over Time</h3>
          <Tooltip title="This line chart displays your net cash flow and its cumulative forecast over the selected period.">
            <InfoCircleOutlined />
          </Tooltip>
        </div>

        <div className="line mb-5">
          <Line
            data={chartData.lineData}
            options={{
              ...options,
              plugins: {
                ...options.plugins,
                title: {
                  display: true,
                  text:    'Net Cash Flow & Forecast',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Monthly Cash Flow Section */}
      <div className="chart-block">
        <div className="chart-title">
          <h3>Monthly Cash Flow</h3>
          <Tooltip title="This bar chart compares monthly cash inflows and outflows.">
            <InfoCircleOutlined />
          </Tooltip>
        </div>

        <div className="bar mb-5">
          <Bar
            data={chartData.barData}
            options={{
              ...options,
              plugins: {
                ...options.plugins,
                title: {
                  display: true,
                  text:    'Monthly Cash Inflow vs. Outflow',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Stacked Bar Section */}
      <div className="chart-block">
        <div className="chart-title">
          <h3>Income & Expenses Breakdown</h3>
          <Tooltip title="This stacked bar chart splits monthly totals into recurring and one-time amounts for both incomes and expenses.">
            <InfoCircleOutlined />
          </Tooltip>
        </div>

        <div className="stacked-bar mb-5">
          <Bar data={chartData.stackedBarData} options={stackedOptions} />
        </div>
      </div>

      {/* Comparison Chart Section */}
      <div className="chart-block">
        <div className="chart-title">
          <h3>Income & Expenses Comparison</h3>
          <Tooltip title="This chart compares total income and expenses between the first and second halves of the selected period.">
            <InfoCircleOutlined />
          </Tooltip>
        </div>

        <div className="comparison-chart">
          <Bar data={chartData.comparisonData} options={comparisonOptions} />
        </div>
      </div>
    </>
  );
};

export default CashFlowCharts;
