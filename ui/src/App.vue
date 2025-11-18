<script setup lang="ts">
import type { SidebarItem } from '@/components/AppShell.vue';

import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import { KButton } from '@kong/kongponents';
import {
  BillingIcon,
  CogIcon,
  DashboardIcon,
  MoneyIcon,
  ProfileIcon,
} from '@kong/icons';
import AppShell from '@/components/AppShell.vue';

const auth = useAuthStore();
const router = useRouter();

const isAuthed = computed(() => auth.authenticated);

const sidebarTopItems = computed<SidebarItem[]>(() => {
  if (!isAuthed.value) {
    return [
      {
        key:   'home',
        label: 'Home',
        to:    { name: 'home' },
        icon:  DashboardIcon,
      },
    ];
  }

  return [
    {
      key:   'dashboard',
      label: 'Dashboard',
      to:    { name: 'dashboard' },
      icon:  DashboardIcon,
    },
    {
      key:   'incomes',
      label: 'Incomes',
      to:    { name: 'incomes' },
      icon:  MoneyIcon,
    },
    {
      key:   'expenses',
      label: 'Expenses',
      to:    { name: 'expenses' },
      icon:  BillingIcon,
    },
  ];
});

const sidebarBottomItems = computed<SidebarItem[]>(() => {
  if (!isAuthed.value) {
    return [
      {
        key:   'login',
        label: 'Login',
        to:    { name: 'login' },
        icon:  ProfileIcon,
      },
      {
        key:   'register',
        label: 'Register',
        to:    { name: 'register' },
        icon:  ProfileIcon,
      },
    ];
  }

  return [
    {
      key:   'settings',
      label: 'Settings',
      to:    { name: 'settings' },
      icon:  CogIcon,
    },
  ];
});

async function handleLogout() {
  try {
    await auth.logout();
    router.push({ name: 'login' });
  } catch(error) {
    console.error('[AppShell] Error logging out', error);
  }
}
</script>

<template>
  <AppShell
    :sidebar-top-items="sidebarTopItems"
    :sidebar-bottom-items="sidebarBottomItems"
  >
    <template #sidebar-header>
      <div class="sidebar__header-logo">
        <img
          src="@/assets/images/horus.png"
          alt="Horus Holdings logo"
          class="sidebar__logo"
        >
        <span class="sidebar__title">
          Horus Holdings
        </span>
      </div>
    </template>

    <template #header-right>
      <KButton
        v-if="isAuthed"
        appearance="secondary"
        size="small"
        @click="handleLogout"
      >
        Logout
      </KButton>
    </template>

    <router-view />
  </AppShell>
</template>

<style lang="scss" scoped>
.sidebar {
  &__header {
    padding: 1rem;
    border-bottom: 1px solid var(--kp-color-border-200);
    margin-bottom: 1rem;
  }

  &__header-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__logo {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }

  &__title {
    font-weight: 600;
  }
}
</style>
