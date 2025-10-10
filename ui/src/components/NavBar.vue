<script setup lang="ts">
import {
  ref, computed, onMounted, onBeforeUnmount, watch
} from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import { useViewport } from '@/composables/useViewport';

import ToggleTheme from '@/components/ToggleTheme.vue';
import { KButton } from '@kong/kongponents';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const { width } = useViewport();

const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const isMobile = computed(() => width.value < 768);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function handleClickOutside(e: MouseEvent) {
  if (!isMobile.value) {
    return;
  }

  const el = menuRef.value;

  if (el && !el.contains(e.target as Node)) {
    isMenuOpen.value = false;
  }
}

function onNavClick() {
  if (isMobile.value) {
    isMenuOpen.value = false;
  }
}

async function logout() {
  try {
    await auth.logout();

    router.push('/login');
  } catch(e) {
    console.log('[Navbar]: Error logging out', e);
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));

watch(() => route.fullPath, () => {
  if (isMobile.value) {
    isMenuOpen.value = false;
  }
});
</script>

<template>
  <nav
    ref="menuRef"
    class="navbar"
  >
    <div class="navbar-container">
      <header class="navbar-header">
        <img
          src="@/assets/images/horus.png"
          alt="Logo"
          rel="preload"
        >
        <RouterLink
          class="brand text-bold"
          to="/"
        >
          Horus Holdings
        </RouterLink>

        <!-- Mobile menu toggle -->
        <KButton
          v-if="isMobile"
          class="menu-toggle"
          aria-label="Menu"
          @click.prevent="toggleMenu"
        >
          <span class="menu-icon">☰</span>
        </KButton>
      </header>

      <div
        class="navbar-links"
        :class="{ active: isMobile && isMenuOpen }"
        @click.capture="onNavClick"
      >
        <div
          v-if="auth.authenticated"
          class="authenticated-group"
        >
          <RouterLink
            class="nav-link text-bold"
            to="/dashboard"
          >
            Dashboard
          </RouterLink>
          <RouterLink
            class="nav-link text-bold"
            to="/incomes"
          >
            Incomes
          </RouterLink>
          <RouterLink
            class="nav-link text-bold"
            to="/expenses"
          >
            Expenses
          </RouterLink>
          <RouterLink
            v-if="auth.authenticated"
            class="nav-link text-bold"
            to="/settings"
          >
            Settings
          </RouterLink>

          <div class="divider" />
        </div>


        <div class="navbar-auth mt-5">
          <template v-if="!auth.authenticated">
            <div class="flex flex-col">
              <RouterLink
                class="nav-link text-bold"
                to="/login"
              >
                Login
              </RouterLink>
              <RouterLink
                class="nav-link text-bold"
                to="/register"
              >
                Register
              </RouterLink>
            </div>
          </template>
          <template v-else>
            <KButton
              class="btn text-bold"
              @click="logout"
            >
              Logout
            </KButton>
          </template>
        </div>

        <div
          v-if="!isMobile"
          class="theme-button"
        >
          <ToggleTheme />
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
a {
  text-decoration: inherit;
}

h1 {
  font-size: 2.5rem;
  line-height: 1.2;
  color: var(--foreground-primary);
}

.navbar {
  grid-area: nav;
  grid-column: 1 / 2;
  grid-row: 1;
  background-color: var(--background-secondary);
  color: var(--foreground-primary);
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  overflow-y: auto;
  top: 0;
  bottom: 0;
  width: 220px;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
}

.navbar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 220px;
  padding: 1rem;
  box-sizing: border-box;
  position: fixed;
}

header {
  color: var(--foreground-primary);
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
  justify-content: center;
  box-sizing: border-box;
  padding: 0.5rem 1rem;
}

header img {
  width: 50px;
  height: 50px;
  margin-right: 1rem;
}

header .brand {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--foreground-primary);
}

.navbar-links, .authenticated-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
}

.navbar-links a {
  padding: 0.5rem 1rem;
  margin: 0.5rem 0;
  width: 100%;
  color: var(--foreground-primary);
  text-decoration: none;
  transition: background-color 0.3s;
  cursor: pointer;
  box-sizing: border-box;
  border-radius: .5rem;
}

.navbar-links a:hover {
  color: var(--foreground-nav);
  background-color: var(--background-tertiary);
  text-decoration: underline;
}

.theme-button {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
}

.menu-icon {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--foreground-primary);
  cursor: pointer;
  width: 24px;
  height: 24px;
}

@media (max-width: 1075px) {
  .navbar {
    width: 180px;
  }

  h1 {
    font-size: 1rem;
  }

  header img {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 725px) {
  .navbar {
    position: fixed;
    height: 60px;
    z-index: 99;
    border-bottom: 1px solid var(--foreground-tertiary);
    width: 100%;
    justify-content: center;
    align-items: center;
    padding: 0 1rem;
    background-color: var(--background-secondary);
  }

  .navbar-container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .25rem 1rem;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0;
    padding: 0;
  }

  header h1 {
    margin-left: 1rem;
    font-size: 1.25rem;
  }

  header img {
    margin: 0;
  }

  .menu-icon {
    display: block;
  }

  .navbar-links {
    display: none;
    position: absolute;
    top: 60px;
    width: calc(100% - 2rem);
    left: 1rem;
    right: 0;
    background-color: var(--background-secondary);
    flex-direction: column;
    padding: 1rem;
    z-index: 98;
  }

  .navbar-links.active {
    display: flex;
  }

  .theme-button {
    position: relative;
  }
}
</style>
