<script setup lang="ts">
import type { Component } from 'vue';

import {
  computed,
  ref,
  watch,
  useSlots,
} from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { MenuIcon } from '@kong/icons';

export interface SidebarItem {
  key:   string;
  label: string;
  to: {
    name?: string;
    path?: string;
  };
  icon?: Component;
}

defineProps<{
  sidebarTopItems:     SidebarItem[];
  sidebarBottomItems?: SidebarItem[];
}>();

const slots = useSlots();
const route = useRoute();

const mobileSidebarOpen = ref(false);

// const hasSidebarTopSlot = computed(() => !!slots['sidebar-top']);
const hasSidebarBottomSlot = computed(() => !!slots['sidebar-bottom']);
const hasSidebarHeaderSlot = computed(() => !!slots['sidebar-header']);
const hasSidebarFooterSlot = computed(() => !!slots['sidebar-footer']);
const hasHeaderLeftSlot = computed(() => !!slots['header-left']);
const hasHeaderRightSlot = computed(() => !!slots['header-right']);

function closeSidebar() {
  mobileSidebarOpen.value = false;
}

function toggleSidebar() {
  mobileSidebarOpen.value = !mobileSidebarOpen.value;
}

// Close mobile sidebar on route change
watch(
  () => route.fullPath,
  () => {
    if (mobileSidebarOpen.value) {
      mobileSidebarOpen.value = false;
    }
  },
);
</script>

<template>
  <div class="shell">
    <!-- Mobile overlay -->
    <div
      v-if="mobileSidebarOpen"
      class="shell__overlay"
      @click="closeSidebar"
    />

    <!-- LEFT SIDEBAR -->
    <aside
      class="shell__sidebar"
      :class="{
        'sidebar-open': mobileSidebarOpen,
      }"
    >
      <div class="shell__sidebar-inner">
        <!-- Sidebar header (logo / title) -->
        <header
          v-if="hasSidebarHeaderSlot"
          class="shell__sidebar-header"
        >
          <slot name="sidebar-header" />
        </header>

        <!-- Sidebar top navigation -->
        <nav class="shell__sidebar-section shell__sidebar-top">
          <slot name="sidebar-top">
            <ul class="shell__sidebar-list">
              <li
                v-for="item in sidebarTopItems"
                :key="item.key"
                class="shell__sidebar-item"
              >
                <RouterLink
                  :to="item.to"
                  class="shell__sidebar-link"
                >
                  <component
                    :is="item.icon"
                    v-if="item.icon"
                    class="shell__sidebar-link-icon"
                  />
                  <span class="shell__sidebar-link-label">
                    {{ item.label }}
                  </span>
                </RouterLink>
              </li>
            </ul>
          </slot>
        </nav>

        <div
          v-if="sidebarTopItems.length > 0 && sidebarBottomItems?.length"
          class="shell__sidebar-level-divider"
          role="separator"
        />

        <!-- Sidebar bottom navigation -->
        <nav
          v-if="hasSidebarBottomSlot || (sidebarBottomItems && sidebarBottomItems.length > 0)"
          class="shell__sidebar-section shell__sidebar-bottom"
        >
          <slot name="sidebar-bottom">
            <ul class="shell__sidebar-list">
              <li
                v-for="item in sidebarBottomItems"
                :key="item.key"
                class="shell__sidebar-item"
              >
                <RouterLink
                  :to="item.to"
                  class="shell__sidebar-link"
                >
                  <component
                    :is="item.icon"
                    v-if="item.icon"
                    class="shell__sidebar-link-icon"
                  />
                  <span class="shell__sidebar-link-label">
                    {{ item.label }}
                  </span>
                </RouterLink>
              </li>
            </ul>
          </slot>
        </nav>

        <footer
          v-if="hasSidebarFooterSlot"
          class="shell__sidebar-footer"
        >
          <slot name="sidebar-footer" />
        </footer>
      </div>
    </aside>

    <!-- RIGHT SIDE: HEADER / CONTENT -->
    <div class="shell__main">
      <header class="shell__header">
        <div class="shell__header-left">
          <button
            type="button"
            class="shell__mobile-toggle"
            aria-label="Toggle navigation"
            @click="toggleSidebar"
          >
            <MenuIcon />
          </button>

          <slot
            v-if="hasHeaderLeftSlot"
            name="header-left"
          />
        </div>

        <div
          v-if="hasHeaderRightSlot"
          class="shell__header-right"
        >
          <slot name="header-right" />
        </div>
      </header>

      <main class="shell__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  height: 100vh;
  width: 100%;
  overflow: hidden;

  /* Overlay for mobile sidebar */
  &__overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 15;
  }

  &__sidebar {
    grid-area: sidebar;
    background-color: var(--background-secondary);
    color: var(--foreground-primary);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 1rem;
    box-sizing: border-box;
    z-index: 20;
  }

  &__sidebar-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  &__sidebar-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  &__sidebar-footer {
    position: absolute;
    bottom: 1rem;
    width: calc(260px - 2rem);
  }

  &__sidebar-section {
    display: flex;
    flex-direction: column;
  }

  &__sidebar-top {
    flex-shrink: 0;
    margin-top: 1rem;
  }

  &__sidebar-bottom {
    flex-shrink: 0;
  }

  &__sidebar-spacer {
    flex: 1 1 auto;
  }

  &__sidebar-level-divider {
    background-color: var(--foreground-primary, rgba(255, 255, 255, 0.1));
    height: 1px;
    margin: var(--ui-space-80, 24px) auto;
    min-height: 1px;
    width: calc(100% - 32px);
  }

  &__sidebar-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__sidebar-item + &__sidebar-item {
    margin-top: 0.25rem;
  }

  &__sidebar-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    color: var(--foreground-primary);
    text-decoration: none;
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
    cursor: pointer;
  }

  &__sidebar-link-icon {
    flex-shrink: 0;
  }

  &__sidebar-link-label {
    white-space: nowrap;
  }

  /* router-link-active comes from vue-router */
  &__sidebar-link.router-link-active {
    background-color: var(--background-tertiary);
    color: var(--foreground-nav);
  }

  &__sidebar-link:hover {
    background-color: var(--background-tertiary);
    color: var(--foreground-nav);
    text-decoration: underline;
  }

  &__main {
    grid-area: header / header / main / main;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    grid-template-areas:
      "header"
      "main";
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background-color: var(--background-secondary);
  }

  &__content {
    grid-area: main;
    padding: 1rem;
    box-sizing: border-box;
    overflow: auto;
    border-top-left-radius: 4px;
    background-color: var(--background-primary);
  }

  &__header {
    grid-area: header;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    box-sizing: border-box;
    background-color: var(--background-secondary);
    color: var(--foreground-primary);
    z-index: 10;
  }

  &__header-left,
  &__header-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__mobile-toggle {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 999px;
    border: 1px solid var(--foreground-tertiary);
    background: transparent;
    cursor: pointer;
  }

  &__mobile-toggle span {
    display: block;
    width: 60%;
    height: 2px;
    margin: 0 auto;
    border-radius: 999px;
    background-color: var(--foreground-primary);
  }
}

@media (max-width: 768px) {
  .shell {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    grid-template-areas:
      "header"
      "main";

    &__sidebar {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      max-width: 75%;
      transform: translateX(-100%);
      transition: transform 0.2s ease-out;
      box-shadow: 0 0 24px rgba(0, 0, 0, 0.4);
    }

    &__sidebar.sidebar-open {
      transform: translateX(0);
    }

    &__mobile-toggle {
      display: inline-flex;
    }

    &__content {
      border-top-left-radius: 0;
    }
  }
}
</style>
