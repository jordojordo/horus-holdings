<script setup lang="ts">
import type {
  FinanceItemKind,
  FinancialItem,
  RecurrencePayload,
  RecurrenceKind,
} from "@/types";
import type { Toast } from '@kong/kongponents'

import { ref, watch, computed } from "vue";
import dayjs from "dayjs";
import axios from "axios";

import { useToaster } from '@/composables';
import { useThemeStore } from '@/stores/theme';
import { getServiceConfig } from "@/utils/service";

import RecurrenceBuilder from "@/components/RecurrenceBuilder/RecurrenceBuilder.vue";

type Kind = FinanceItemKind;

const props = defineProps<{
  kind: Kind;
  visible: boolean;
  itemToUpdate?: FinancialItem | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: 'saved', toast: Toast): void
}>();

const { apiUrl } = getServiceConfig();
const themeStore = useThemeStore();
const { toaster } = useToaster();

const isEdit = computed(() => !!props.itemToUpdate?.id);
const kindLabel = computed(() => props.kind === "income" ? "Income" : "Expense");

type FormModel = {
  name: string;
  amount: number;
  category?: string;
};
const form = ref<FormModel>({
  name: "",
  amount: 0,
  category: undefined,
});

const recurrence = ref<RecurrencePayload>({
  recurrenceKind: "none",
  anchorDate: dayjs().format("YYYY-MM-DD"),
  endDate: undefined,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
  weekendAdjustment: "none",
  includeDates: undefined,
  excludeDates: undefined,
  simple: undefined,
  rrule: undefined,
});

const submitting = ref(false);

const canSubmit = computed(() => {
  return !!form.value.name && !!form.value.amount
})

function resetFromItem() {
  const it = props.itemToUpdate;

  form.value = {
    name: it?.name ?? "",
    amount: it?.amount ?? 0,
    category: it?.category,
  };

  const kind: RecurrenceKind = it?.recurrenceKind ?? "none";

  if (kind === "none") {
    const d = it?.date || dayjs().format("YYYY-MM-DD");

    recurrence.value = {
      recurrenceKind: "none",
      anchorDate: d, // one-time uses date=anchor
      endDate: it?.endDate,
      timezone: it?.timezone || recurrence.value.timezone,
      weekendAdjustment: it?.weekendAdjustment || "none",
      includeDates: it?.includeDates,
      excludeDates: it?.excludeDates,
    };
  } else if (kind === "simple") {
    recurrence.value = {
      recurrenceKind: "simple",
      anchorDate: it?.anchorDate || dayjs().format("YYYY-MM-DD"),
      endDate: it?.endDate,
      timezone: it?.timezone || recurrence.value.timezone,
      weekendAdjustment: it?.weekendAdjustment || "none",
      includeDates: it?.includeDates,
      excludeDates: it?.excludeDates,
      simple: it?.simple ?? { type: "weekly", interval: 1, daysOfWeek: [] },
      rrule: undefined,
      count: it?.count,
    };
  } else {
    // rrule
    recurrence.value = {
      recurrenceKind: "rrule",
      anchorDate: it?.anchorDate || dayjs().format("YYYY-MM-DD"),
      endDate: it?.endDate,
      timezone: it?.timezone || recurrence.value.timezone,
      weekendAdjustment: it?.weekendAdjustment || "none",
      includeDates: it?.includeDates,
      excludeDates: it?.excludeDates,
      simple: undefined,
      rrule: it?.rrule || "",
      count: it?.count,
    };
  }
}

watch(
  () => [props.visible, props.itemToUpdate],
  () => {
    if (props.visible) {
      resetFromItem();
    }
  },
  { immediate: true }
);

function onClose() {
  emit("close");
}

function buildPayload() {
  const base = {
    name: form.value.name,
    amount: form.value.amount ?? 0,
    category: form.value.category,
  };

  if (recurrence.value.recurrenceKind === "none") {
    const anchorDate = recurrence.value.anchorDate; // One-off uses anchor as the date

    return {
      ...base,
      date: anchorDate,
      recurrence: {
        ...recurrence.value,
        simple: undefined,
        rrule: undefined,
        count: recurrence.value.count,
      },
    };
  }

  // 'simple' or 'rrule'
  return {
    ...base,
    recurrence: {
      ...recurrence.value,
    },
  };
}

async function onSubmit() {
  if (!canSubmit.value) {
    toaster.open({
      title: 'Missing information',
      message: 'Please enter a name and amount before saving.',
      appearance: 'danger'
    });

    return;
  }

  try {
    submitting.value = true;
    const payload = buildPayload();

    if (isEdit.value && props.itemToUpdate?.id) {
      await axios.put(
        `${apiUrl}/${props.kind}/${props.itemToUpdate.id}`,
        payload
      );

      toaster.open({
        appearance: 'success',
        title: `${kindLabel.value} updated`,
        message: 'tst'
      });
    } else {
      await axios.post(`${apiUrl}/${props.kind}`, payload);

      toaster.open({
        appearance: 'success',
        title: `${kindLabel.value} created`,
        message: 'tst'

      });
    }

    emit("saved", { appearance: 'success', message: `${kindLabel.value} ${isEdit.value ? 'updated' : 'created'}` });
    onClose();
  } catch (e: any) {
    const msg = e?.response?.data?.error || e?.message || "Request failed";

    toaster.open({
      appearance: 'danger',
      message: msg,
      title: 'Error',
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <KModal
    :visible="visible"
    :title="isEdit ? 'Edit ' + kindLabel : 'Add ' + kindLabel"
    :action-button-text="isEdit ? 'Save' : 'Create'"
    :action-button-disabled="submitting || !canSubmit"
    :style="themeStore.isDark ? { '--kui-color-background-neutral-weakest': 'var(--background-secondary)' } : {}"
    @proceed="onSubmit"
    @cancel="onClose"
  >
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <KInput
          id="finance-name"
          v-model="form.name"
          label="Name"
          placeholder="e.g., Paycheck, Groceries"
          required
        />
      </div>

      <div class="flex flex-col gap-2">
        <KInput
          id="finance-amount"
          v-model.number="form.amount"
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          required
        />
      </div>

      <div class="flex flex-col gap-2">
        <KInput
          id="finance-category"
          v-model="form.category"
          label="Category"
          placeholder="Optional (e.g., Rent, Food)"
        />
      </div>

      <hr class="border-t border-gray-200 dark:border-gray-700" />

      <RecurrenceBuilder v-model="recurrence" />
    </div>
  </KModal>
</template>
