<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router'

import { useAuthStore } from '@/stores/auth';

const { isLoading, authenticated } = useAuthStore();
const router = useRouter();

if (!isLoading && authenticated) {
  router.push({ name: 'dashboard' });
}
</script>

<template>
  <div className="auth-container">
    <div v-if="isLoading">
      <KSkeleton type="form" />;
    </div>

    <div v-else class="auth-links">
      <h1>Horus Holdings</h1>
      <RouterLink class="btn text-bold" to="/login">Login</RouterLink>
      <RouterLink class="btn text-bold" to="/register">Register</RouterLink>
    </div>
  </div>
</template>
