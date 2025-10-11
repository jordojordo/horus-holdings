<script setup lang="ts">
import type { MultiselectItem } from '@kong/kongponents';
import type { SimpleRecurrence, MonthlyOrdinal, WeekdayOrdinal } from '@/types';

import { computed } from 'vue';
import { SIMPLE_TYPES, SIMPLE_TYPE_LABELS } from '@/types/Recurrence';

const simple = defineModel<SimpleRecurrence>({ required: true });

const patternOptions = SIMPLE_TYPES.map((t) => ({
  label: SIMPLE_TYPE_LABELS[t],
  value: t 
}));

const weekdayOptions: MultiselectItem[] = [
  {
    label: 'Sun',
    value: '0' 
  },
  {
    label: 'Mon',
    value: '1' 
  },
  {
    label: 'Tue',
    value: '2' 
  },
  {
    label: 'Wed',
    value: '3' 
  },
  {
    label: 'Thu',
    value: '4' 
  },
  {
    label: 'Fri',
    value: '5' 
  },
  {
    label: 'Sat',
    value: '6' 
  },
];

const ordinalOptions: MultiselectItem[] = [
  {
    label: '1st',
    value: '1' 
  },
  {
    label: '2nd',
    value: '2' 
  },
  {
    label: '3rd',
    value: '3' 
  },
  {
    label: '4th',
    value: '4' 
  },
  {
    label: 'Last',
    value: '-1' 
  },
];

const customDays = computed({
  get: () => Array.isArray((simple.value as any)?.days) ? (simple.value as any).days.join(', ') : '',
  set: (val: string) => {
    const parts = parseMonthDays(val ?? '');

    simple.value = {
      type: 'customDays',
      days: parts 
    } as any;
  },
});

function ensureWeeklySeed() {
  if (simple.value.type === 'weekly' && (!('daysOfWeek' in simple.value) || !simple.value.daysOfWeek?.length)) {
    const d = new Date();

    simple.value = {
      type:       'weekly',
      interval:   1,
      daysOfWeek: [d.getDay()] 
    };
  }
}

function parseMonthDays(input: string): number[] {
  const cleaned = String(input || '')
    .split(',')
    .map((s) => Number(String(s).trim()))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 31);

  return Array.from(new Set(cleaned)).sort((a, b) => a - b);
}

function setPattern(value: SimpleRecurrence['type'] | undefined) {
  switch (value) {
    case 'weekly':
      return (simple.value = {
        type:       'weekly',
        interval:   1,
        daysOfWeek: simple.value.type === 'weekly' && simple.value.daysOfWeek?.length ? simple.value.daysOfWeek : [new Date().getDay()] 
      });
    case 'everyNDays':
      return (simple.value = {
        type: 'everyNDays',
        n:    2 
      });
    case 'biweekly':
      return (simple.value = {
        type:    'biweekly',
        weekday: new Date().getDay() 
      });
    case 'monthlyDay':
      return (simple.value = {
        type: 'monthlyDay',
        day:  1 
      });
    case 'monthlyOrdinal':
      return (simple.value = {
        type:    'monthlyOrdinal',
        ordinal: 1 as MonthlyOrdinal,
        weekday: 1 as WeekdayOrdinal 
      });
    case 'semiMonthly':
      return (simple.value = {
        type: 'semiMonthly',
        days: [1, 15] 
      });
    case 'quarterly':
      return (simple.value = {
        type: 'quarterly',
        day:  1 
      });
    case 'semiannual':
      return (simple.value = {
        type:      'semiannual',
        monthDays: [{
          month: 1,
          day:   1 
        }, {
          month: 7,
          day:   1 
        }] 
      });
    case 'customDays':
      return (simple.value = {
        type: 'customDays',
        days: (simple.value as any)?.days?.length ? (simple.value as any).days : [1, 15] 
      } as any);
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Pattern selector -->
    <div>
      <KLabel>Pattern</KLabel>
      <KSelect
        v-model="(simple.type as any)"
        :items="patternOptions"
        placeholder="Select pattern"
        @update:model-value="setPattern($event as any)"
      />
    </div>

    <!-- Editors by pattern -->
    <div
      v-if="simple.type === 'weekly'"
      class="flex gap-4 items-end"
    >
      <KInput
        v-model="(simple as any).interval"
        label="Every N weeks"
        :min="1"
        :max="52"
        :step="1"
        type="number"
      />
      <KMultiselect
        v-model="(simple as any).daysOfWeek"
        label="Days of week"
        type="number"
        :items="weekdayOptions"
        @blur="ensureWeeklySeed"
      />
    </div>

    <div v-else-if="simple.type === 'everyNDays'">
      <KInput
        v-model="(simple as any).n"
        label="Every N days"
        type="number"
        :min="1"
        :max="31"
        :step="1"
      />
    </div>

    <div v-else-if="simple.type === 'biweekly'">
      <KSelect
        v-model="(simple as any).weekday"
        label="Weekday"
        type="number"
        min="0"
        max="6"
        step="1"
      />
    </div>

    <div v-else-if="simple.type === 'monthlyDay'">
      <KInput
        v-model="(simple as any).day"
        label="Day of month"
        type="number"
        :min="1"
        :max="31"
        :step="1"
      />
    </div>

    <div
      v-else-if="simple.type === 'monthlyOrdinal'"
      class="flex gap-4"
    >
      <KSelect
        v-model="(simple as any).ordinal"
        label="Ordinal"
        :items="ordinalOptions"
      />
      <KSelect
        v-model="(simple as any).weekday"
        label="Weekday"
        :items="[
          { label: 'Sun', value: 0 },{ label: 'Mon', value: 1 },{ label: 'Tue', value: 2 },
          { label: 'Wed', value: 3 },{ label: 'Thu', value: 4 },{ label: 'Fri', value: 5 },
          { label: 'Sat', value: 6 },
        ]"
      />
    </div>

    <div v-else-if="simple.type === 'semiMonthly'">
      <div class="flex gap-4 items-end">
        <KInput
          v-model="(simple as any).days[0]"
          label="Day A"
          :min="1"
          :max="31"
        />
        <KInput
          v-model="(simple as any).days[1]"
          label="Day B"
          :min="1"
          :max="31"
        />
      </div>
    </div>

    <div v-else-if="simple.type === 'quarterly'">
      <KInput
        v-model="(simple as any).day"
        label="Day of quarter start month"
        :min="1"
        :max="31"
      />
    </div>

    <div v-else-if="simple.type === 'semiannual'">
      <div class="flex flex-col gap-2">
        <div class="text-sm text-muted-foreground">
          Occurs on both dates below:
        </div>
        <div class="flex gap-4">
          <div class="flex gap-2 items-end">
            <KInput
              v-model="(simple as any).monthDays[0].month"
              label="Month A"
              :min="1"
              :max="12"
            />
            <KInput
              v-model="(simple as any).monthDays[0].day"
              label="Day A"
              :min="1"
              :max="31"
            />
          </div>
          <div class="flex gap-2 items-end">
            <KInput
              v-model="(simple as any).monthDays[1].month"
              label="Month B"
              :min="1"
              :max="12"
            />
            <KInput
              v-model="(simple as any).monthDays[1].day"
              label="Day B"
              :min="1"
              :max="31"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="simple.type === 'customDays'">
      <div class="flex flex-col gap-1">
        <KLabel>Custom days (comma separated)</KLabel>
        <KInput
          v-model="customDays"
          placeholder="e.g. 1, 15, 28"
        />
        <div class="text-xs text-muted-foreground">
          Valid range 1–31; duplicates removed; sorted.
        </div>
      </div>
    </div>
  </div>
</template>
