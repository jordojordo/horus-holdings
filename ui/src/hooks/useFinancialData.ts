import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import type { Income } from '@/types/Income';
import type { Expense } from '@/types/Expense';

import { useSocketContext } from '@/context/SocketContext';
import { getServiceConfig } from '@/utils/service';

type HookArgs = {
  rangeStartISO: string; // 'YYYY-MM-DD'
  rangeEndISO: string;   // 'YYYY-MM-DD'
};

export type NewItemMessage =
  | { type: 'new_expense'; data: Expense }
  | { type: 'new_income';  data: Income };

/**
 * Fetches incomes/expenses for a given window and expects each item to include an
 * `occurrences: string[]` array (server-expanded), plus `recurrenceKind` to classify recurring vs one-off.
 * Listens for 'new_item' socket messages and merges them in (best-effort without occurrences).
 */
export const useFinancialData = ({ rangeStartISO, rangeEndISO }: HookArgs) => {
  const { setOnMessage } = useSocketContext();
  const { apiUrl } = getServiceConfig();

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const fetchAll = useCallback(async() => {
    const params = {
      start: rangeStartISO,
      end:   rangeEndISO
    };
    const [incRes, expRes] = await Promise.all([
      axios.get(`${ apiUrl }/income`, { params }),
      axios.get(`${ apiUrl }/expense`, { params }),
    ]);

    setIncomes(incRes.data || []);
    setExpenses(expRes.data || []);
  }, [apiUrl, rangeStartISO, rangeEndISO]);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  const handleNewItem = useCallback((message: NewItemMessage) => {
    if (!message || !message.type) {
      return;
    };

    if (message.type === 'new_expense') {
      setExpenses((prev) => [message.data as Expense, ...prev]);
    } else if (message.type === 'new_income') {
      setIncomes((prev) => [message.data as Income, ...prev]);
    }
  }, []);

  useEffect(() => {
    setOnMessage('new_item', handleNewItem as (d: unknown) => void);
  }, [handleNewItem, setOnMessage]);

  return {
    incomes,
    expenses
  };
};
