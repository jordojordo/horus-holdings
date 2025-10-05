<script setup lang="ts">
import { ref, watch } from 'vue'

import { useThemeStore } from '@/stores/theme'

import { KSelect } from '@kong/kongponents'

const themeStore = useThemeStore()
const mode = ref(themeStore.theme)

const themeOptions = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

watch(mode, (val) => {
  themeStore.setTheme(val as any)
})

watch(
  () => themeStore.theme,
  v => { mode.value = v }
)
</script>

<template>
  <div class="theme-toggle">
    <KSelect
      v-model="mode"
      :items="themeOptions"
      placeholder="Theme"
    />
  </div>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  width: 7rem;
}
</style>

