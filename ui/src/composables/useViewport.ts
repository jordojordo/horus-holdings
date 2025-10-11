import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useViewport() {
  const width = ref<number>(window.innerWidth);

  const onResize = () => {
    width.value = window.innerWidth;
  };

  onMounted(() => window.addEventListener('resize', onResize));
  onBeforeUnmount(() => window.removeEventListener('resize', onResize));

  return { width };
}
