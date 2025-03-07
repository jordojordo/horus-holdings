import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { Income } from '@/types/Income';
import { Expense } from '@/types/Expense';

import { useSocketContext } from '@/context/SocketContext';
import { getServiceConfig } from '@/utils/service';

export const useFinancialData = () => {
  const { setOnMessage } = useSocketContext();
  const { apiUrl } = getServiceConfig();

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const fetchIncomes = useCallback(async() => {
    try {
      const response = await axios.get(`${ apiUrl }/income`);

      setIncomes(response.data);
    } catch (error: any) {
      console.error(
        'Unable to fetch incomes:',
        error?.message || error?.response?.data?.error
      );
    }
  }, [apiUrl]);

  const fetchExpenses = useCallback(async() => {
    try {
      const response = await axios.get(`${ apiUrl }/expense`);

      setExpenses(response.data);
    } catch (error: any) {
      console.error(
        'Unable to fetch expenses:',
        error?.message || error?.response?.data?.error
      );
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchIncomes();
    fetchExpenses();
  }, [fetchIncomes, fetchExpenses]);

  const handleNewItem = useCallback((event: MessageEvent) => {
    const message = JSON.parse(event.data);

    if (message.type === 'new_expense') {
      setExpenses((prev) => [...prev, message.data]);
    }
    if (message.type === 'new_income') {
      setIncomes((prev) => [...prev, message.data]);
    }
  }, []);

  useEffect(() => {
    setOnMessage('new_item', handleNewItem);
  }, [handleNewItem, setOnMessage]);

  return {
    incomes,
    expenses
  };
};
