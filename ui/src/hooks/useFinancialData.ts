import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

import type { Income } from '@/types/Income';
import type { Expense } from '@/types/Expense';

import { useSocketContext } from '@/context/SocketContext';
import { getServiceConfig } from '@/utils/service';

export type NewItemMessage =
  | { type: 'new_expense'; data: Expense }
  | { type: 'new_income';  data: Income };

export const useFinancialData = () => {
  const { setOnMessage } = useSocketContext();
  const { apiUrl } = getServiceConfig();

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const fetchIncomes = useCallback(async() => {
    try {
      const response = await axios.get(`${ apiUrl }/income`);

      setIncomes(response.data);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(
          'Unable to fetch incomes:',
          error?.message || error?.response?.data?.error
        );
      }
    }
  }, [apiUrl]);

  const fetchExpenses = useCallback(async() => {
    try {
      const response = await axios.get(`${ apiUrl }/expense`);

      setExpenses(response.data);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(
          'Unable to fetch expenses:',
          error?.message || error?.response?.data?.error
        );
      }
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchIncomes();
    fetchExpenses();
  }, [fetchIncomes, fetchExpenses]);

  const handleNewItem = useCallback((message: NewItemMessage) => {
    if (message.type === 'new_expense') {
      setExpenses((prev) => [...prev, message.data]);
    } else if (message.type === 'new_income') {
      setIncomes((prev) => [...prev, message.data]);
    }
  }, []);

  useEffect(() => {
    // setOnMessage expects (data: unknown) => void, so this matches
    setOnMessage('new_item', handleNewItem as (d: unknown) => void);
  }, [handleNewItem, setOnMessage]);

  return {
    incomes,
    expenses
  };
};
