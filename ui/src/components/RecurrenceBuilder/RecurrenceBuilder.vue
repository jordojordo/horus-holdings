<script setup lang="ts">
import type {
  RecurrencePayload,
  SimpleRecurrence,
  WeekendAdjustment,
} from '@/types/Recurrence'

import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import axios from 'axios'

import { getServiceConfig } from '@/utils/service'
import { useToaster } from '@/composables'

import SimpleEditor from '@/components/RecurrenceBuilder/SimpleEditor.vue'

const model = defineModel<RecurrencePayload>({
  default: {
    recurrenceKind: 'none',
    anchorDate: undefined,
    endDate: undefined,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
    weekendAdjustment: 'none',
    includeDates: undefined,
    excludeDates: undefined,
    simple: undefined,
    rrule: undefined,
  },
})

const { apiUrl } = getServiceConfig()

const { toaster } = useToaster();

// weekday from current anchorDate (0=Sun..6=Sat). Falls back to today.
function anchorWeekday(): number {
  const d = model.value.anchorDate ? new Date(model.value.anchorDate) : new Date()

  return d.getDay()
}

function defaultSimple(): SimpleRecurrence {
  return { type: 'weekly', interval: 1, daysOfWeek: [anchorWeekday()] }
}

function setSimple(s: SimpleRecurrence) {
  model.value.recurrenceKind = 'simple'
  model.value.simple = s
  model.value.rrule = undefined
}

watch(
  () => model.value.recurrenceKind,
  (kind) => {
    if (kind === 'simple' && !model.value.simple) {
      setSimple(defaultSimple())
    }
  },
  { immediate: true }
)

watch(
  () => model.value.anchorDate,
  () => {
    const s = model.value.simple as any

    if (model.value.recurrenceKind === 'simple' && s?.type === 'weekly' && (!s.daysOfWeek || !s.daysOfWeek.length)) {
      setSimple({ type: 'weekly', interval: s?.interval ?? 1, daysOfWeek: [anchorWeekday()] } as SimpleRecurrence)
    }
  }
)

const defaultTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
const tzOptions = computed(() => [
  { label: defaultTZ, value: defaultTZ },
  { label: 'America/New_York', value: 'America/New_York' },
  { label: 'UTC', value: 'UTC' },
])

const weekendOptions: { label: string; value: WeekendAdjustment }[] = [
  { label: 'No weekend adjustment', value: 'none' },
  { label: 'Move to next business day', value: 'next' },
  { label: 'Move to previous business day', value: 'prev' },
  { label: 'Move to nearest business day', value: 'nearest' },
]

const recurrenceKindOptions = [
  { label: 'One‑off', value: 'none' },
  { label: 'Simple', value: 'simple' },
  { label: 'Advanced', value: 'rrule' },
]

const anchorWrapper = computed< { start: Date | null, end: Date | null } >({
  get() {
    return {
      start: model.value.anchorDate ? new Date(model.value.anchorDate) : null,
      end: null,
    }
  },
  set(val) {
    const next = val?.start ? dayjs(val.start).format('YYYY-MM-DD') : undefined

    if (model.value.anchorDate !== next) {
      model.value.anchorDate = next
    }
  },
})

const endWrapper = computed< { start: Date | null, end: Date | null } >({
  get() {
    return {
      start: model.value.endDate ? new Date(model.value.endDate) : null,
      end: null,
    }
  },
  set(val) {
    const next = val?.start ? dayjs(val.start).format('YYYY-MM-DD') : undefined

    if (model.value.endDate !== next) {
      model.value.endDate = next
    }
  },
})

const loading = ref(false)
const preview = ref<string[]>([])

const previewWindow = computed(() => ({
  start: dayjs().format('YYYY-MM-DD'),
  end: dayjs().add(120, 'day').format('YYYY-MM-DD'),
}))

async function doPreview() {
  try {
    loading.value = true
    const { data } = await axios.post(`${apiUrl}/recurrence/preview`, {
      payload: model.value,
      window: previewWindow.value,
    })

    preview.value = Array.isArray(data?.dates) ? data.dates : []
  } catch (e: any) {
    const msg = e?.response?.data?.error || e?.message || 'Failed to preview recurrence'

    toaster.open({ title: 'Error', message: msg, appearance: 'danger' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="recurrence-builder flex flex-col gap-6 w-full">
    <div class="flex flex-wrap between gap-8 mb-4">
      <div class="flex flex-col gap-1 w-45">
        <KLabel>Anchor date</KLabel>
        <KDateTimePicker
          v-model="anchorWrapper"
          mode="date"
          :range="false"
          placeholder="Anchor date"
          clear-button
        />
      </div>
      <div class="flex flex-col gap-1 w-45">
        <KLabel>End date</KLabel>
        <KDateTimePicker
          v-model="endWrapper"
          mode="date"
          :range="false"
          clear-button
          placeholder="End date (optional)"
        />
      </div>
      <div class="flex flex-col gap-1">
        <KLabel>Timezone</KLabel>
        <KSelect
          v-model="model.timezone"
          :items="tzOptions"
          clearable
        />
      </div>
      <div class="flex flex-col gap-1">
        <KLabel>Weekend adjustment</KLabel>
        <KSelect
          v-model="model.weekendAdjustment"
          :items="weekendOptions"
        />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <KLabel>Recurrence type</KLabel>
      <KSegmentedControl
        v-model="model.recurrenceKind"
        :options="recurrenceKindOptions"
        size="small"
      />
      <p v-if="model.recurrenceKind === 'none'" class="text-sm text-neutral-600 dark:text-neutral-400">
        This will use the anchor date as the due date.
      </p>
    </div>

    <div v-if="model.recurrenceKind === 'simple' && model.simple" class="flex flex-col gap-4">
      <SimpleEditor v-model="model.simple" />
    </div>

    <div v-if="model.recurrenceKind === 'rrule'" class="flex flex-col gap-2">
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        Paste iCalendar RRULE here. You may include multiple RRULE lines and an optional DTSTART line.
      </p>
      <KTextArea
        v-model="model.rrule"
        :rows="6"
      />
    </div>

    <div class="flex flex-col gap-2 mt-4">
      <KButton :loading="loading" @click="doPreview">Preview next dates</KButton>
      <div class="flex flex-wrap gap-2">
        <KBadge v-for="d in preview.slice(0, 12)" :key="d" appearance="neutral">{{ d }}</KBadge>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
