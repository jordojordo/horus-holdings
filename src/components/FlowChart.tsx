import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { Bar, Line } from 'react-chartjs-2';
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
} from 'chart.js';

import { useWebSocketContext } from '../context/WebSocketContext';
import { getWebsocketConfig } from '../utils/service';

import DateRange from './DateRange';
import { Expense } from '../types/Expense';
import { Income } from '../types/Income';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
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
}

const FlowChart: React.FC = () => {
  const { setOnMessage } = useWebSocketContext();

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const today = dayjs();
  const oneMonthAgo = dayjs().subtract(1, 'month');

  const [startDate, setStartDate] = useState<Dayjs>(oneMonthAgo);
  const [endDate, setEndDate] = useState<Dayjs>(today);

  const { apiUrl } = getWebsocketConfig();

  const url = `${ apiUrl }`;

  const fetchIncomes = useCallback(async() => {
    try {
      const response = await axios.get(`${ url }/incomes`);

      setIncomes(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [url]);

  const fetchExpenses = useCallback(async() => {
    try {
      const response = await axios.get(`${ url }/expenses`);

      setExpenses(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [url]);

  useEffect(() => {
    fetchIncomes();
    fetchExpenses();
  }, [fetchIncomes, fetchExpenses]);

  const handleNewItem = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if ( message.type === 'new_expense' ) {
        setExpenses((prevExpenses) => [...prevExpenses, message.data]);
      }

      if ( message.type === 'new_income' ) {
        setIncomes((prevIncomes) => [...prevIncomes, message.data]);
      }
    },
    [setIncomes, setExpenses]
  );

  useEffect(() => {
    setOnMessage(handleNewItem);
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

    while ( date <= endDate ) {
      labels.push(`${ date.format('MMM').toUpperCase() } ${ date.year() }`);
      incomeData.push(0);
      expenseData.push(0);
      date = date.add(1, 'month');
    }

    const addRecurringAmount = (
      amount: number,
      incomeStartDate: Dayjs,
      recurrenceType: string,
      recurrenceEndDate: Dayjs | undefined,
      data: number[]
    ) => {
      const recurrenceInterval = {
        'bi-weekly':  14,
        monthly:      30,
        'bi-monthly': 60,
      }[recurrenceType];

      let date = incomeStartDate.clone();
      const effectiveEndDate = recurrenceEndDate || endDate;

      while ( date <= effectiveEndDate && recurrenceInterval ) {
        if ( date >= startDate && date <= effectiveEndDate ) {
          const monthIndex = date.diff(startDate.startOf('month'), 'month');

          if ( monthIndex >= 0 && monthIndex < data.length ) {
            data[monthIndex] += amount;
          }
        }

        date = date.add(recurrenceInterval, 'day');
      }
    };

    incomes.forEach((income) => {
      const incomeStartDate = income.date ? dayjs(income.date) : startDate;

      if ( income.recurring && income.recurrenceType ) {
        addRecurringAmount(
          income.amount,
          incomeStartDate,
          income.recurrenceType,
          income.recurrenceEndDate ? dayjs(income.recurrenceEndDate) : undefined,
          incomeData
        );
      } else if (income.date) {
        const incomeDate = dayjs(income.date);

        if (incomeDate >= startDate && incomeDate <= endDate) {
          const monthIndex = incomeDate.diff(startDate, 'month');

          incomeData[monthIndex] += income.amount;
        }
      }
    });

    expenses.forEach((expense) => {
      const expenseStartDate = expense.date ? dayjs(expense.date) : startDate;

      if ( expense.recurring && expense.recurrenceType ) {
        addRecurringAmount(
          expense.amount,
          expenseStartDate,
          expense.recurrenceType,
          expense.recurrenceEndDate ? dayjs(expense.recurrenceEndDate) : undefined,
          expenseData
        );
      } else if ( expense.date ) {
        const expenseDate = dayjs(expense.date);

        if (expenseDate >= startDate && expenseDate <= endDate) {
          const monthIndex = expenseDate.diff(startDate, 'month');

          expenseData[monthIndex] += expense.amount;
        }
      }
    });

    let cumulativeSum = 0;

    incomeData.forEach((income, index) => {
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
    };
  };

  const { barData, lineData } = processChartData(
    incomes,
    expenses,
    startDate,
    endDate
  );

  const options = {
    responsive: true,
    plugins:    {
      legend: { position: 'top' as const },
      title:  {
        display: true,
        text:    'Cash Flow Overview',
      },
    },
  };

  const handleDateRangeChange = (start: Dayjs, end: Dayjs) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div>
      <DateRange
        initialStartDate={startDate}
        initialEndDate={endDate}
        onDateRangeChange={handleDateRangeChange}
      />
      <Bar data={barData} options={options} />
      <Line data={lineData} options={options} />
    </div>
  );
};

export default FlowChart;
