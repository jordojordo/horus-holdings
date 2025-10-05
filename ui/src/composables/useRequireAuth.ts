import { nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

/**
 * Call inside setup() of any component that must be authed.
 * Router guards already protect pages, but this prevents accidental
 * execution of effects in nested components and defaults to redirect.
 */
export async function useRequireAuth({ redirectIfGuest = true } = {}) {
  const auth = useAuthStore();
  const route = useRoute();
  const router = useRouter();

  if (auth.isLoading) {
    await new Promise<void>((resolve) => {
      const stop = auth.$subscribe(() => {
        if (!auth.isLoading) {
          stop();
          resolve();
        }
      });

      nextTick(() => {
        if (!auth.isLoading) {
          stop();
          resolve();
        }
      });
    });
  }

  if (!auth.authenticated && redirectIfGuest) {
    router.replace({
 name:  'login',
query: { redirect: route.fullPath }
});
  }

  return {
 auth,
ready: auth.authenticated && !auth.isLoading
};
}
