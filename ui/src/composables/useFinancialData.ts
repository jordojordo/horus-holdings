import type { Expense, Income } from '@/types';
import type { ComputedRef } from 'vue';
import {
  ref, watch, onMounted, onBeforeUnmount, toValue
} from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { getServiceConfig } from '@/utils/service';
import { useSocketStore } from '@/stores/socket';
import { useAuthStore } from '@/stores/auth';

export type NewItemMessage =
  | { type: 'new_expense'; data: Expense }
  | { type: 'new_income'; data: Income };

// Accept ISO strings, not Date objects
type Args = {
  rangeStartISO: ComputedRef<string | undefined>; // 'YYYY-MM-DD'
  rangeEndISO:   ComputedRef<string | undefined>; // 'YYYY-MM-DD'
};

export function useFinancialData({ rangeStartISO, rangeEndISO }: Args) {
  const incomes = ref<Income[]>([]);
  const expenses = ref<Expense[]>([]);

  const { apiUrl } = getServiceConfig();
  const socket = useSocketStore();
  const auth = useAuthStore();
  const router = useRouter();

  let controller: AbortController | null = null;

  const normalizeList = <T = any>(data: any): T[] => {
    if (Array.isArray(data?.items)) {
      return data.items as T[];
    }

    if (Array.isArray(data?.data))  {
      return data.data  as T[];
    }
    if (Array.isArray(data))        {
      return data       as T[];
    }

    return [];
  };

  const fetchAllPages = async(kind: 'income' | 'expense', params: Record<string, any>) => {
    const pageSize = 1000;
    let page = 1;
    let aggregated: any[] = [];

    const first = await axios.get(`${ apiUrl }/${ kind }`, {
      params: {
        ...params, page, pageSize
      },
      signal: controller!.signal,
    });

    const firstRows = normalizeList(first.data);
    const total = Number.isFinite(first?.data?.total) ? Number(first.data.total) : firstRows.length;

    aggregated = aggregated.concat(firstRows);

    while (aggregated.length < total) {
      page += 1;

      const { data } = await axios.get(`${ apiUrl }/${ kind }`, {
        params: {
          ...params, page, pageSize
        },
        signal: controller!.signal,
      });

      aggregated = aggregated.concat(normalizeList(data));
    }

    return aggregated;
  };

  const fetchAll = async() => {
    try {
      controller?.abort();
      controller = new AbortController();

      const start = toValue(rangeStartISO);
      const end   = toValue(rangeEndISO);

      const params: Record<string, any> = {};

      if (start) {
        params.start = start;
      }
      if (end)   {
        params.end   = end;
      }

      const [incRows, expRows] = await Promise.all([
        fetchAllPages('income', params),
        fetchAllPages('expense', params),
      ]);

      incomes.value = incRows as Income[];
      expenses.value = expRows as Expense[];
    } catch(e: any) {
      console.log('[useFinancialData]: error fetching finances', e?.message);

      if (e?.response?.status === 401) {
        auth.logout();
        router.push({ name: 'home' });
      }
    }
  };

  const handleNewItem = (raw: unknown) => {
    const msg = raw as Partial<NewItemMessage> | undefined;

    if (!msg || typeof msg !== 'object') {
      return;
    }

    if (msg.type === 'new_expense' && msg.data) {
      expenses.value = [msg.data as Expense, ...expenses.value];
    } else if (msg.type === 'new_income' && msg.data) {
      incomes.value = [msg.data as Income, ...incomes.value];
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

  // Refetch when date window changes (ISO strings)
  watch(
    () => [toValue(rangeStartISO), toValue(rangeEndISO)],
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
