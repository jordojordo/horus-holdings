import { onBeforeUnmount } from 'vue';
import { ToastManager } from '@kong/kongponents';

export function useToaster() {
  const toaster = new ToastManager();

  onBeforeUnmount(() => {
    toaster.destroy();
  });

  return { toaster };
}
