<script setup lang="ts">
import type { FinanceItemKind } from '@/types';

import ItemTable from '@/components/ItemTable.vue';

const { financeKind = 'income' } = defineProps<{
  financeKind?: FinanceItemKind;
}>();
</script>

<template>
  <div>
    <h1 class="mb-10">
      {{ financeKind === 'income' ? 'Incomes' : 'Expenses' }}
    </h1>
    <ItemTable :item-kind="financeKind" />
  </div>
</template>
