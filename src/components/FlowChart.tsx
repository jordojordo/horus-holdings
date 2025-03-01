import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import dayjs, { Dayjs, ManipulateType } from 'dayjs';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Col, Row, Statistic } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';

import { useSocketContext } from '@/context/SocketContext';
import { getServiceConfig } from '@/utils/service';

import DateRange from '@/components/DateRange';
import { Expense } from '@/types/Expense';
import { Income } from '@/types/Income';

import '@/assets/style/FlowChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

interface ChartData {
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
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  savingsRate: number;
  highestIncomeMonth: string;
  highestExpenseMonth: string;
}

type RecurrenceType = 'bi-weekly' | 'monthly' | 'bi-monthly';

const FlowChart: React.FC = () => {
  const { setOnMessage } = useSocketContext();

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const today = dayjs();
  const oneMonthAgo = dayjs().subtract(1, 'month');

  const [startDate, setStartDate] = useState<Dayjs>(oneMonthAgo);
  const [endDate, setEndDate] = useState<Dayjs>(today);

  const { apiUrl } = getServiceConfig();

  const fetchIncomes = useCallback(async() => {
    try {
      const response = await axios.get(`${ apiUrl }/income`);

      setIncomes(response.data);
    } catch (error: any) {
      throw new Error(`Unable to fetch incomes: ${ error?.message || error?.response?.data?.error }`);
    }
  }, [apiUrl]);

  const fetchExpenses = useCallback(async() => {
    try {
      const response = await axios.get(`${ apiUrl }/expense`);

      setExpenses(response.data);
    } catch (error: any) {
      throw new Error(`Unable to fetch expenses: ${ error?.message || error?.response?.data?.error }`);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchIncomes();
    fetchExpenses();
  }, [fetchIncomes, fetchExpenses]);

  const handleNewItem = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.type === 'new_expense') {
        setExpenses((prevExpenses) => [...prevExpenses, message.data]);
      }

      if (message.type === 'new_income') {
        setIncomes((prevIncomes) => [...prevIncomes, message.data]);
      }
    },
    [setIncomes, setExpenses]
  );

  useEffect(() => {
    setOnMessage('new_item', handleNewItem);
  }, [handleNewItem, setOnMessage]);

  const processChartData = (
    incomes: Income[],
    expenses: Expense[],
    startDate: Dayjs,
    endDate: Dayjs
  ): ChartData => {
    const labels: string[] = [];
    const incomeData: number[] = [];
    const expenseData: number[] = [];
    const netCashFlowData: number[] = [];
    const cumulativeCashFlowData: number[] = [];

    let date = startDate.clone();

    while (date <= endDate) {
      labels.push(`${ date.format('MMM').toUpperCase() } ${ date.year() }`);
      incomeData.push(0);
      expenseData.push(0);
      date = date.add(1, 'month');
    }

    const addRecurringAmount = (
      amount: number,
      entryStartDate: Dayjs,
      recurrenceType: string,
      recurrenceEndDate: Dayjs | undefined,
      data: number[]
    ) => {
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
      };

      const recurrenceInterval = recurrenceIntervals[recurrenceType as RecurrenceType];

      if (!recurrenceInterval) {
        return;
      }

      let date = entryStartDate.clone();
      const effectiveEndDate = recurrenceEndDate || endDate;

      while (date <= effectiveEndDate) {
        if (date >= startDate && date <= effectiveEndDate) {
          const monthIndex = date.diff(startDate.startOf('month'), 'month');

          if (monthIndex >= 0 && monthIndex < data.length) {
            data[monthIndex] += amount;
          }
        }
        date = date.add(recurrenceInterval.value, recurrenceInterval.unit);
      }
    };

    incomes?.forEach((income) => {
      const incomeStartDate = income?.date ? dayjs(income.date) : startDate;

      if (income?.recurring && income?.recurrenceType) {
        addRecurringAmount(
          income?.amount,
          incomeStartDate,
          income.recurrenceType,
          income?.recurrenceEndDate ? dayjs(income.recurrenceEndDate) : undefined,
          incomeData
        );
      } else if (income?.date) {
        const incomeDate = dayjs(income.date);

        if (incomeDate >= startDate && incomeDate <= endDate) {
          const monthIndex = incomeDate?.diff(startDate.startOf('month'), 'month');

          incomeData[monthIndex] += income?.amount;
        }
      }
    });

    expenses?.forEach((expense) => {
      const expenseStartDate = expense?.date ? dayjs(expense.date) : startDate;

      if (expense?.recurring && expense?.recurrenceType) {
        addRecurringAmount(
          expense?.amount,
          expenseStartDate,
          expense.recurrenceType,
          expense?.recurrenceEndDate ? dayjs(expense.recurrenceEndDate) : undefined,
          expenseData
        );
      } else if (expense?.date) {
        const expenseDate = dayjs(expense.date);

        if (expenseDate >= startDate && expenseDate <= endDate) {
          const monthIndex = expenseDate?.diff(startDate.startOf('month'), 'month');

          expenseData[monthIndex] += expense?.amount;
        }
      }
    });

    let cumulativeSum = 0;

    incomeData?.forEach((income, index) => {
      netCashFlowData[index] = income - expenseData[index];
      cumulativeSum += netCashFlowData[index];
      cumulativeCashFlowData[index] = cumulativeSum;
    });

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
    };

    const totalIncome = incomeData?.reduce((sum, val) => sum + val, 0);
    const totalExpenses = expenseData?.reduce((sum, val) => sum + val, 0);
    const netIncome = totalIncome - totalExpenses;
    const numberOfMonths = labels?.length;
    const averageMonthlyIncome = totalIncome / numberOfMonths;
    const averageMonthlyExpenses = totalExpenses / numberOfMonths;
    const savingsRate = totalIncome !== 0 ? (netIncome / totalIncome) * 100 : 0;

    const highestIncome = Math.max(...incomeData);
    const highestExpense = Math.max(...expenseData);
    const highestIncomeMonthIndex = incomeData?.indexOf(highestIncome);
    const highestExpenseMonthIndex = expenseData?.indexOf(highestExpense);
    const highestIncomeMonth = labels[highestIncomeMonthIndex];
    const highestExpenseMonth = labels[highestExpenseMonthIndex];

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
            backgroundColor: ['rgba(44, 182, 125, 0.4)', 'rgba(255, 127, 80, 0.4)'],
            data:            [totalIncome, totalExpenses],
          },
        ],
      },
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

  const {
    barData,
    lineData,
    pieData,
    totalIncome,
    totalExpenses,
    netIncome,
    averageMonthlyIncome,
    averageMonthlyExpenses,
    savingsRate,
    highestIncomeMonth,
    highestExpenseMonth,
  } = processChartData(incomes, expenses, startDate, endDate);

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
      <div className='mb-10'>
        <Row gutter={16}>
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
            <Statistic
              title="Savings Rate"
              value={savingsRate}
              precision={2}
              suffix="%"
            />
          </Col>
        </Row>
      </div>
      <div className='mb-10'>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Avg Monthly Income"
              value={averageMonthlyIncome}
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Avg Monthly Expenses"
              value={averageMonthlyExpenses}
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Highest Income Month"
              value={highestIncomeMonth}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Highest Expense Month"
              value={highestExpenseMonth}
            />
          </Col>
        </Row>
      </div>
      <div className="pie mb-5">
        <Pie data={pieData} options={options} />
      </div>
      <div className="line mb-5">
        <Line data={lineData} options={options} />
      </div>
      <div className="bar">
        <Bar data={barData} options={options} />
      </div>
    </div>
  );
};

export default FlowChart;
