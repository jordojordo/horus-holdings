<script setup lang="ts">
import type { AxiosError } from 'axios';

import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import AuthForm from '@/components/AuthForm.vue';

const { isLoading, login, register } = useAuthStore();
const router = useRouter();

const handleSubmit = async(e: { username: string, password: string }) => {
  try {
    if (e.username && e.password) {
      await register(e.username, e.password);
      await login(e.username, e.password);

      router.push({ name: 'dashboard' })
    }
  } catch (error: unknown) {
    const err = error as AxiosError;

    if (err?.message as string) {
      console.log(err.message); // TODO: replace with toaster
    }
  }
}
</script>

<template>
  <div class="auth-container">
    <div v-if="isLoading">
      <KSkeleton type="form" />
    </div>
    <AuthForm type="register" @submit="handleSubmit" />
  </div>
</template>
