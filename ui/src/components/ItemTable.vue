<script setup lang="ts">
import type { FinancialItem, FinanceItemKind, RecurrenceKind } from '@/types'

import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import dayjs from 'dayjs'
import axios from 'axios'
import { ToastManager } from '@kong/kongponents'

import { getServiceConfig } from '@/utils/service'
import { useSocketStore } from '@/stores/socket'
import { useThemeStore } from '@/stores/theme'

import FinancialForm from '@/components/FinancialForm.vue'
import { AddIcon, EditIcon, TrashIcon } from '@kong/icons'

const headers = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
  { key: 'recurrenceKind', label: 'Recurrence' },
  { key: 'actions', label: 'Actions' }
]

const { itemKind } = defineProps<{ itemKind: FinanceItemKind }>()

const { apiUrl } = getServiceConfig()
const socket = useSocketStore()
const themeStore = useThemeStore()

const loading = ref(false)
const items = ref<FinancialItem[]>([])
const searchField = ref('')
const sortField = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc' | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

// Modal state
const showEdit = ref(false)
const itemToUpdate = ref<FinancialItem | undefined>(undefined)

// Prompt state
const promptVisible = ref(false)
const itemToDelete = ref<FinancialItem | undefined>(undefined)

// Initialize a ToastManager instance to show success/error messages.  The
// toaster instance must be destroyed when the component unmounts.
const toaster = new ToastManager()

onBeforeUnmount(() => {
  toaster.destroy()
})

function formatDate(iso?: string | null): string {
  return iso ? dayjs(iso).format('YYYY-MM-DD') : ''
}

function formatCurrency(v: number | string): string {
  const n = typeof v === 'string' ? Number(v) : v

  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n || 0)
}

async function fetchItems(): Promise<void> {
  try {
    loading.value = true
    const { data } = await axios.get(`${apiUrl}/${itemKind}`)

    items.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error(err)
    toaster.open({ title: 'Failed to load items', appearance: 'danger' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchItems()
  socket.setOnMessage(`new_${itemKind}`, (payload: any) => {
    const data = payload?.data

    if (data) {
      items.value = [data, ...items.value]
    }
  })
})

onBeforeUnmount(() => {
  socket.off(`new_${itemKind}`)
})

watch(() => itemKind, () => {
  fetchItems()
})

const filteredItems = computed(() => {
  return items.value.filter(item => {
    const field = searchField.value.toLowerCase()
    const matchName = !searchField.value || item.name?.toLowerCase().includes(field)
    const matchCategory = !searchField.value || (item.category ?? '').toLowerCase().includes(field)

    return matchName || matchCategory
  })
})

const sortedItems = computed(() => {
  const filtered = [...filteredItems.value]

  if (!sortField.value || !sortOrder.value) {
    return filtered
  }

  filtered.sort((a: any, b: any) => {
    const field = sortField.value as string
    let aVal: any = a[field]
    let bVal: any = b[field]

    if (field === 'amount') {
      aVal = Number(aVal)
      bVal = Number(bVal)
    } else if (field === 'date') {
      aVal = aVal ? new Date(aVal).getTime() : 0
      bVal = bVal ? new Date(bVal).getTime() : 0
    } else {
      // compare strings (name, category, recurrenceKind)
      aVal = (aVal ?? '').toString().toLowerCase()
      bVal = (bVal ?? '').toString().toLowerCase()
    }

    if (aVal > bVal) {
      return sortOrder.value === 'asc' ? 1 : -1
    }

    if (aVal < bVal) {
      return sortOrder.value === 'asc' ? -1 : 1
    }

    return 0
  })

  return filtered
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value

  return sortedItems.value.slice(start, end)
})

/**
 * Handle the sort event emitted by KTableView.  The payload contains
 * `sortColumnKey` and `sortColumnOrder`, where the order is 'asc' or 'desc'.
 * When sorting, reset the current page to 1 to avoid displaying an empty
 * page if the new sort reduces the number of pages.
 */
function onSort({ sortColumnKey, sortColumnOrder }: { sortColumnKey?: string; sortColumnOrder?: 'asc' | 'desc' }): void {
  sortField.value = sortColumnKey || null
  sortOrder.value = sortColumnOrder || null
  currentPage.value = 1
}

/**
 * Update the current page when KPagination emits a page-change event.  The
 * event payload includes the new page number (1-indexed). Rely on
 * computed pagination rather than using the `visibleItems` returned by the
 * event.
 */
function onPageChange({ page }: { page: number }): void {
  currentPage.value = page
}

function onPageSizeChange({ pageSize: newSize }: { pageSize: number }): void {
  pageSize.value = newSize
  currentPage.value = 1
}

function openAdd(): void {
  itemToUpdate.value = undefined
  showEdit.value = true
}

function onEdit(item: FinancialItem): void {
  itemToUpdate.value = item
  showEdit.value = true
}

function closeEdit(): void {
  showEdit.value = false
  itemToUpdate.value = undefined
}

async function handleSaved(): Promise<void> {
  await fetchItems()
}

function confirmDelete(item: FinancialItem): void {
  itemToDelete.value = item
  promptVisible.value = true
}

function cancelDelete(): void {
  promptVisible.value = false
  itemToDelete.value = undefined
}

async function proceedDelete(): Promise<void> {
  const item = itemToDelete.value

  if (!item) {
    return
  }

  try {
    await axios.delete(`${apiUrl}/${itemKind}/${item.id}`)
    toaster.open({ title: 'Deleted', appearance: 'success' })
    items.value = items.value.filter(i => i.id !== item.id)
  } catch (err) {
    console.error(err)
    toaster.open({ title: 'Failed to delete', appearance: 'danger' })
  } finally {
    promptVisible.value = false
    itemToDelete.value = undefined
  }
}

function recurrenceBadge(recurrence: RecurrenceKind | undefined) {
  switch (recurrence) {
    case 'simple':
      return 'info'
      break;
    case 'rrule':
      return 'decorative'
      break;
    default:
      return 'neutral'
      break;
  }
}
</script>

<template>
  <KSkeleton v-if="loading" type="table" />
  <div v-else class="item-table">
    <div class="toolbar">
      <div class="search-fields">
        <KInput
          v-model="searchField"
          placeholder="Search..."
        />
      </div>
      <KButton appearance="primary" @click="openAdd">
        <template #default>
          <AddIcon />
          Add {{ itemKind }}
        </template>
      </KButton>
    </div>

    <KTableView
      :data="paginatedItems"
      :headers="headers"
      :loading="loading"
      hide-pagination
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
        <KDropdownItem danger has-divider @click="confirmDelete(row as FinancialItem)">
          <template #default>
            <TrashIcon />
            Delete
          </template>
        </KDropdownItem>
      </template>
    </KTableView>

    <div class="pagination-container">
      <KPagination
        :total-count="sortedItems.length"
        :page-sizes="[5, 10, 20, 50]"
        :current-page="currentPage"
        :initial-page-size="pageSize"
        :style="themeStore.isDark ? { '--kui-color-background-primary-weakest': 'var(--purple-medium)' } : {}"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      />
    </div>

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
        <br/>This action cannot be undone.
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
</style>
