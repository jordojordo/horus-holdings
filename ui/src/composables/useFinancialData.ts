import type { Expense, Income } from '@/types';
import type { ComputedRef } from 'vue';

import {
 ref, watch, onMounted, onBeforeUnmount, toValue
} from 'vue';
import axios from 'axios';

import { getServiceConfig } from '@/utils/service';
import { useSocketStore } from '@/stores/socket';

export type NewItemMessage =
  | { type: 'new_expense'; data: Expense }
  | { type: 'new_income'; data: Income };

type Args = {
  rangeStartRef: ComputedRef<Date | null>; // 'YYYY-MM-DD'
  rangeEndRef: ComputedRef<Date | null>; // 'YYYY-MM-DD'
};

export function useFinancialData({ rangeStartRef, rangeEndRef }: Args) {
  const incomes = ref<Income[]>([]);
  const expenses = ref<Expense[]>([]);

  const { apiUrl } = getServiceConfig();
  const socket = useSocketStore();

  // Abort in-flight requests when the window changes quickly
  let controller: AbortController | null = null;

  const fetchAll = async() => {
    try {
      controller?.abort();
      controller = new AbortController();

      const params = {
        start: toValue(rangeStartRef),
        end:   toValue(rangeEndRef),
      };

      const [incRes, expRes] = await Promise.all([
        axios.get(`${ apiUrl }/income`, {
          params,
          signal: controller.signal,
        }),
        axios.get(`${ apiUrl }/expense`, {
          params,
          signal: controller.signal,
        }),
      ]);

      incomes.value = Array.isArray(incRes.data) ? incRes.data : [];
      expenses.value = Array.isArray(expRes.data) ? expRes.data : [];
    } catch (e) {
      console.log('[useFinancialData]: error fetching finances', e);
    }
  };

  const handleNewItem = (raw: unknown) => {
    const msg = raw as Partial<NewItemMessage> | undefined;

    if (!msg || typeof msg !== 'object' || !('type' in msg!) || !('data' in msg!)) {
      return;
    }

    if (msg!.type === 'new_expense') {
      expenses.value = [msg!.data as Expense, ...expenses.value];
    } else if (msg!.type === 'new_income') {
      incomes.value = [msg!.data as Income, ...incomes.value];
    }
  };

  onMounted(() => {
    fetchAll();

    socket.setOnMessage('new_item', handleNewItem);
  });

  onBeforeUnmount(() => {
    socket.off('new_item', handleNewItem);

    controller?.abort();
  });

  // Refetch when date window changes
  watch(
    () => [toValue(rangeStartRef), toValue(rangeEndRef)],
    () => {
      fetchAll();
    },
    { flush: 'post' },
  );

  return {
    incomes,
    expenses,
    refresh: fetchAll,
  };
}
