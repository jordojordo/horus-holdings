<script setup lang="ts">
import { ref } from 'vue';

import { KInput, KButton } from '@kong/kongponents'

const { type = 'login' } = defineProps<{
  type?: 'login' | 'register';
}>()

const emit = defineEmits<{
  (e: 'submit', payload: { username: string, password: string }): void
}>()

const username = ref<string>('');
const password = ref<string>('');

const handleSubmit = () => {
  emit('submit', { username: username.value, password: password.value });
}
</script>

<template>
  <form class="auth-form" @submit.prevent="handleSubmit">
    <h1>{{ type }}</h1>
    <KInput
      v-model="username"
      type="text"
      placeholder="Username"
    />
    <KInput
      v-model="password"
      type="password"
      placeholder="Password"
    />
    <KButton appearance="primary" type="submit" class="w-full">
      {{ type }}
    </KButton>
  </form>
</template>

<style>
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--background-primary);
  color: var(--foreground-primary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  width: 300px;
  text-align: center;
}

.auth-form h1 {
  margin-bottom: 2rem;
  font-size: 2.5rem;
  text-align: center;
}

.auth-form input {
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: none;
  border-radius: 5px;
}

.auth-form button {
  width: 100%;
  padding: 0.75rem;
  margin: 1rem 0;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.auth-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

@media (max-width: 725px) {
  .auth-container {
    min-height: calc(100vh - 100px);
  }

  .auth-form {
    width: 100%;
  }
}
</style>
