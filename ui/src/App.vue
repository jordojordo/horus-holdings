<script setup lang="ts">
import Navbar from '@/components/NavBar.vue';
</script>

<template>
  <div class="container">
    <Navbar />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.container {
  height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: 'nav content';
  box-sizing: border-box;
  background-color: var(--background-secondary);
  color: var(--foreground-secondary);
}

.content {
  grid-area: content;
  background-color: var(--background-primary);
  color: var(--foreground-primary);
  position: relative;
  box-sizing: border-box;
  padding: 1rem;
}

@media (max-width: 1075px) {
  .container {
    grid-template-columns: 180px 1fr;
  }
}

@media (max-width: 725px) {
  .container {
    display: flex;
    flex-direction: column;
    position: relative;
    height: auto;
  }

  .content {
    margin-top: 60px;
    padding: 0;
  }
}
</style>
