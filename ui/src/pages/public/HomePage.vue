<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

const { isLoading, authenticated } = useAuthStore();
const router = useRouter();

if (!isLoading && authenticated) {
  router.push({ name: 'dashboard' });
}
</script>

<template>
  <div class="auth-container">
    <div v-if="isLoading">
      <KSkeleton type="form" />;
    </div>

    <template v-else>
      <h1>Horus Holdings</h1>
      <div class="auth-links">
        <RouterLink
          class="btn text-bold"
          to="/login"
        >
          Login
        </RouterLink>
        <RouterLink
          class="btn text-bold"
          to="/register"
        >
          Register
        </RouterLink>
      </div>
    </template>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 1rem;
}

.auth-links {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  text-align: center;
}
</style>
