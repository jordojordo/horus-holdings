<script setup lang="ts">
import type { AxiosError } from 'axios';

import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import { useToaster } from '@/composables';

import AuthForm from '@/components/AuthForm.vue';

const { isLoading, login } = useAuthStore();
const router = useRouter();
const { toaster } = useToaster();

const handleSubmit = async(e: { username: string; password: string }) => {
  try {
    if (e.username && e.password) {
      await login(e.username, e.password);

      router.push({ name: 'dashboard' });
    }
  } catch(error: unknown) {
    const err = error as AxiosError;

    if (err?.message as string) {
      toaster.open({
        appearance: 'danger',
        title:      'Login failed',
        message:    err.message,
      });
    }
  }
};
</script>

<template>
  <div class="auth-container">
    <div v-if="isLoading">
      <KSkeleton type="form" />
    </div>
    <AuthForm
      v-else
      type="login"
      @submit="handleSubmit"
    />
  </div>
</template>
