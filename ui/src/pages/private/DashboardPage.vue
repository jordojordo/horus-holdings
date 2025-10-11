<script setup lang="ts">
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import FlowChart from '@/components/FlowChart.vue';

const { isLoading, authenticated } = useAuthStore();
const router = useRouter();

if (!authenticated) {
  router.push({ name: 'home' });
}
</script>

<template>
  <div>
    <h1 class="mb-10">
      Dashboard
    </h1>
    <div
      v-if="isLoading"
      class="loading-container"
    >
      <KSkeleton
        :card-count="4"
        :card-max-width="'100%'"
        type="card"
      />
    </div>
    <FlowChart
      v-else
      class="mb-10"
    />
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}
</style>
