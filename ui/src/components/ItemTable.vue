<script setup lang="ts">
import type { FinancialItem, FinanceItemKind, RecurrenceKind } from '@/types';
import type { Toast } from '@kong/kongponents';

import {
  ref, computed, onMounted, onBeforeUnmount, watch
} from 'vue';
import dayjs from 'dayjs';
import axios from 'axios';
import { useRouter } from 'vue-router';

import { getServiceConfig } from '@/utils/service';
import { useAuthStore } from '@/stores/auth';
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
    key:   'recurrenceKind',
    label: 'Recurrence'
  },
  {
    key:   'actions',
    label: 'Actions'
  }
];

const emptyStateProps = {
  title:   `No ${ itemKind }s found`,
  message: `Create a new ${ itemKind } to get started`,
};

const { apiUrl } = getServiceConfig();
const auth = useAuthStore();
const router = useRouter();
const socket = useSocketStore();
const themeStore = useThemeStore();
const { toaster } = useToaster();

const loading = ref(false);
const items = ref<FinancialItem[]>([]);
const recurrenceFilter = ref<'all' | 'recurring' | 'nonRecurring'>('all');
const searchField = ref('');
const sortField = ref<string | null>(null);
const sortOrder = ref<'asc' | 'desc' | null>(null);
const currentPage = ref(1);

// Modal state
const showEdit = ref(false);
const itemToUpdate = ref<FinancialItem | undefined>(undefined);

// Prompt state
const promptVisible = ref(false);
const itemToDelete = ref<FinancialItem | undefined>(undefined);

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

async function fetchItems(): Promise<void> {
  try {
    loading.value = true;
    const { data } = await axios.get(`${ apiUrl }/${ itemKind }`);

    items.value = Array.isArray(data) ? data : [];
  } catch(err) {
    toaster.open({
      title:      'Failed to load items',
      message:    (err as any)?.message,
      appearance: 'danger'
    });

    if ((err as any).response?.status === 401) {
      auth.logout();
      router.push({ name: 'home' });
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchItems();
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

watch(() => itemKind, () => {
  fetchItems();
});

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const field = searchField.value.toLowerCase();
    const matchName = !searchField.value || item.name?.toLowerCase().includes(field);
    const matchCategory = !searchField.value || (item.category ?? '').toLowerCase().includes(field);

    // recurrence filtering based on selected filter
    let matchRecurrence = true;

    if (recurrenceFilter.value === 'recurring') {
      matchRecurrence = !!item.recurrenceKind && item.recurrenceKind !== 'none';
    } else if (recurrenceFilter.value === 'nonRecurring') {
      matchRecurrence = !item.recurrenceKind || item.recurrenceKind === 'none';
    }

    return (matchName || matchCategory) && matchRecurrence;
  });
});

const sortedItems = computed(() => {
  const filtered = [...filteredItems.value];

  if (!sortField.value || !sortOrder.value) {
    return filtered;
  }

  filtered.sort((a: any, b: any) => {
    const field = sortField.value as string;
    let aVal: any = a[field];
    let bVal: any = b[field];

    if (field === 'amount') {
      aVal = Number(aVal);
      bVal = Number(bVal);
    } else if (field === 'date') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    } else {
      // compare strings (name, category, recurrenceKind)
      aVal = (aVal ?? '').toString().toLowerCase();
      bVal = (bVal ?? '').toString().toLowerCase();
    }

    if (aVal > bVal) {
      return sortOrder.value === 'asc' ? 1 : -1;
    }

    if (aVal < bVal) {
      return sortOrder.value === 'asc' ? -1 : 1;
    }

    return 0;
  });

  return filtered;
});

/**
 * Handle the sort event emitted by KTableView.  The payload contains
 * `sortColumnKey` and `sortColumnOrder`, where the order is 'asc' or 'desc'.
 * When sorting, reset the current page to 1 to avoid displaying an empty
 * page if the new sort reduces the number of pages.
 */
function onSort({ sortColumnKey, sortColumnOrder }: { sortColumnKey?: string; sortColumnOrder?: 'asc' | 'desc' }): void {
  sortField.value = sortColumnKey || null;
  sortOrder.value = sortColumnOrder || null;
  currentPage.value = 1;
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
  await fetchItems();
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
          :disabled="!sortedItems.length"
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
    <KTableView
      :data="sortedItems"
      :empty-state-title="emptyStateProps.title"
      :empty-state-message="emptyStateProps.message"
      :headers="headers"
      :loading="loading"
      :style="themeStore.isDark ? { '--kui-color-background-primary-weakest': 'var(--purple-medium)' } : {}"
      @sort="onSort"
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
    </KTableView>

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
