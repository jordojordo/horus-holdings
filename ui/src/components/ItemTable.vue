<script setup lang="ts">
import type { FinancialItem, FinanceItemKind, RecurrenceKind } from '@/types';
import type { TableDataFetcherParams, Toast } from '@kong/kongponents';

import {
  ref, onMounted, onBeforeUnmount, useTemplateRef, toRef, watch
} from 'vue';
import dayjs from 'dayjs';
import axios from 'axios';

import { getServiceConfig } from '@/utils/service';
import { useSocketStore } from '@/stores/socket';
import { useThemeStore } from '@/stores/theme';
import { useToaster } from '@/composables';

import FinancialForm from '@/components/FinancialForm.vue';
import { AddIcon, EditIcon, TrashIcon } from '@kong/icons';

const { itemKind } = defineProps<{ itemKind: FinanceItemKind }>();

const headers = [
  {
    key:      'name',
    label:    'Name',
    sortable: true
  },
  {
    key:      'category',
    label:    'Category',
    sortable: true
  },
  {
    key:      'amount',
    label:    'Amount',
    sortable: true
  },
  {
    key:      'date',
    label:    'Date',
    sortable: true
  },
  {
    key:      'recurrenceKind',
    label:    'Recurrence',
    sortable: true
  },
  {
    key:   'actions',
    label: 'Actions'
  }
];

const { apiUrl } = getServiceConfig();
const socket = useSocketStore();
const themeStore = useThemeStore();
const { toaster } = useToaster();

const tableRef = useTemplateRef('tableDataRef');
const itemKindRef = toRef(() => itemKind);

const loading = ref(false);
const items = ref<FinancialItem[]>([]);
const recurrenceFilter = ref<'all' | 'recurring' | 'nonRecurring'>('all');
const searchField = ref('');

const showEdit = ref(false);
const itemToUpdate = ref<FinancialItem | undefined>(undefined);

const promptVisible = ref(false);
const itemToDelete = ref<FinancialItem | undefined>(undefined);

onMounted(() => {
  socket.setOnMessage(`new_${ itemKind }`, (payload: any) => {
    const data = payload?.data;

    if (data) {
      items.value = [data, ...items.value];
    }
  });
});

onBeforeUnmount(() => {
  socket.off(`new_${ itemKind }`);
});

function formatDate(iso?: string | null): string {
  return iso ? dayjs(iso).format('YYYY-MM-DD') : '';
}

function formatCurrency(v: number | string): string {
  const n = typeof v === 'string' ? Number(v) : v;

  return new Intl.NumberFormat(undefined, {
    style:    'currency',
    currency: 'USD'
  }).format(n || 0);
}

function openAdd(): void {
  itemToUpdate.value = undefined;
  showEdit.value = true;
}

function onEdit(item: FinancialItem): void {
  itemToUpdate.value = item;
  showEdit.value = true;
}

function closeEdit(): void {
  showEdit.value = false;
  itemToUpdate.value = undefined;
}

async function handleSaved(e: Toast): Promise<void> {
  toaster.open(e);
}

function confirmDelete(item: FinancialItem): void {
  itemToDelete.value = item;
  promptVisible.value = true;
}

function cancelDelete(): void {
  promptVisible.value = false;
  itemToDelete.value = undefined;
}

async function proceedDelete(): Promise<void> {
  const item = itemToDelete.value;

  if (!item) {
    return;
  }

  try {
    await axios.delete(`${ apiUrl }/${ itemKind }/${ item.id }`);

    toaster.open({
      message:    `Deleted ${ itemKind }: ${ item.name }`,
      appearance: 'success'
    });
    items.value = items.value.filter((i) => i.id !== item.id);
  } catch(err) {
    console.error(err);
    toaster.open({
      appearance: 'danger',
      title:      'Failed to delete',
      message:    err || 'Request failed'
    });
  } finally {
    promptVisible.value = false;
    itemToDelete.value = undefined;
  }
}

function recurrenceBadge(recurrence: RecurrenceKind | undefined) {
  switch (recurrence) {
    case 'simple':
      return 'info';
    case 'rrule':
      return 'decorative';
    default:
      return 'neutral';
  }
}

const fetcher = async(
  params: TableDataFetcherParams<string, string | number> & { signal?: AbortSignal }
) => {
  const {
    page,
    pageSize,
    sortColumnKey,
    sortColumnOrder,
    query: searchInput,
    signal,
  } = params;

  const qp: Record<string, any> = { page, pageSize };

  if (sortColumnKey && sortColumnOrder) {
    qp.sortBy = sortColumnKey;
    qp.sort = sortColumnOrder;
  }

  if (searchInput?.trim()) {
    qp.q = searchInput.trim();
  }

  if (recurrenceFilter.value !== 'all') {
    qp.recurrence = recurrenceFilter.value; // 'recurring' | 'nonRecurring'
  }

  const { apiUrl } = getServiceConfig();
  const { data } = await axios.get(`${ apiUrl }/${ itemKind }`, { params: qp, signal });

  const rows = Array.isArray(data?.items) ? data.items: Array.isArray(data?.data) ? data.data: Array.isArray(data) ? data: [];

  const total = Number.isFinite(data?.total) ? Number(data.total): Array.isArray(data) ? data.length: 0;

  return { data: rows, total };
};

watch(recurrenceFilter, () => {
  tableRef.value?.revalidate();
});

watch(itemKindRef, () => {
  tableRef.value?.revalidate();
});
</script>

<template>
  <KSkeleton
    v-if="loading"
    type="table"
  />
  <div
    v-else
    class="item-table"
  >
    <div class="toolbar">
      <div class="search-fields">
        <KInput
          v-model="searchField"
          placeholder="Filter..."
          :disabled="loading"
        />
      </div>
      <KButton
        appearance="primary"
        @click="openAdd"
      >
        <template #default>
          <AddIcon />
          Add {{ itemKind }}
        </template>
      </KButton>
    </div>

    <KSegmentedControl
      v-model="recurrenceFilter"
      :options="[
        { label: 'All', value: 'all' },
        { label: 'Recurring', value: 'recurring' },
        { label: 'One‑time', value: 'nonRecurring' }
      ]"
      class="mb-4"
    />

    <KTableData
      ref="tableDataRef"
      :headers="headers"
      :fetcher="fetcher"
      :initial-fetcher-params="{ page: 1, pageSize: 15, sortColumnKey: 'recurrenceKind', sortColumnOrder: 'desc' }"
      :search-input="searchField"
      :client-sort="false"
    >
      <template #amount="{ rowValue }">
        {{ formatCurrency(rowValue) }}
      </template>
      <template #date="{ rowValue }">
        {{ formatDate(rowValue) }}
      </template>
      <template #recurrenceKind="{ row }">
        <KBadge
          :appearance="recurrenceBadge(row.recurrenceKind)"
          :style="themeStore.isDark ? { '--kui-color-background-info-weakest': 'var(--green-dark)' } : {}"
        >
          {{ row.recurrenceKind ?? 'none' }}
        </KBadge>
      </template>
      <template #action-items="{ row }">
        <KDropdownItem @click="onEdit(row as FinancialItem)">
          <template #default>
            <EditIcon />
            Edit
          </template>
        </KDropdownItem>
        <KDropdownItem
          danger
          has-divider
          @click="confirmDelete(row as FinancialItem)"
        >
          <template #default>
            <TrashIcon />
            Delete
          </template>
        </KDropdownItem>
      </template>
    </KTableData>

    <FinancialForm
      v-if="showEdit"
      :kind="itemKind"
      :item-to-update="itemToUpdate"
      :api-url="apiUrl"
      :visible="showEdit"
      @close="closeEdit"
      @saved="handleSaved"
    />

    <KPrompt
      v-if="promptVisible"
      :visible="promptVisible"
      title="Delete this item?"
      action-button-appearance="danger"
      :style="themeStore.isDark ? { '--kui-color-background-neutral-weakest': 'var(--background-secondary)' } : {}"
      @cancel="cancelDelete"
      @proceed="proceedDelete"
    >
      <template #default>
        Are you sure you want to delete {{ `"${itemToDelete?.name}"` }}?
        <br>This action cannot be undone.
      </template>
    </KPrompt>
  </div>
</template>

<style scoped>
.item-table {
  width: 100%;
}

.toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: var(--kui-space-60, 16px);
  flex-wrap: wrap;
  gap: var(--kui-space-40, 12px);
}

.search-fields {
  display: flex;
  gap: var(--kui-space-40, 12px);
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: var(--kui-space-60, 16px);
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 600px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-fields {
    justify-content: stretch;
  }
}
</style>
