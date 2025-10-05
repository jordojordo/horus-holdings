<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div className="not-found-container">
    <h1 className="text-bold mb-5">404</h1>
    <h2 className="mb-10">The page you visited does not exist.</h2>
    <RouterLink class="btn text-bold" to="/dashboard">Go home</RouterLink>
  </div>
</template>

<style>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>