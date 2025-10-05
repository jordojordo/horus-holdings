import type { RouteLocationNormalized } from 'vue-router';

import { createRouter, createWebHistory } from 'vue-router';
import { nextTick } from 'vue';

import { useAuthStore } from '@/stores/auth';
import { routes } from './routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

/** Waits until auth store finishes booting from localStorage. */
async function ensureAuthBooted() {
  const auth = useAuthStore();

  if (!auth.isLoading) {
    return;
  }

  await new Promise<void>((resolve) => {
    const stop = auth.$subscribe(() => {
      if (!auth.isLoading) {
        stop();
        resolve();
      }
    });

    // In case state flips before subscribe attaches
    nextTick(() => {
      if (!auth.isLoading) {
        stop();
        resolve();
      }
    });
  });
}

function wantsAuth(to: RouteLocationNormalized) {
  return Boolean(to.meta.requiresAuth);
}

function guestOnly(to: RouteLocationNormalized) {
  return Boolean(to.meta.guestOnly);
}

router.beforeEach(async(to) => {
  const auth = useAuthStore();

  // Make sure bootFromStorage() has run and finished
  await ensureAuthBooted();

  // Private route -> require login
  if (wantsAuth(to) && !auth.authenticated) {
    return {
 name:  'login',
query: { redirect: to.fullPath }
};
  }

  // Guest route -> bounce logged-in users
  if (guestOnly(to) && auth.authenticated) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;