import { defineStore } from 'pinia';

type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

function prefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme:  (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'system' as ThemeMode,
    isDark: false,
    inited: false,
    mq:     null as MediaQueryList | null,
  }),

  actions: {
    init() {
      if (this.inited) {
        return;
      }

      this.inited = true;

      // create media query once
      this.mq = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

      if (this.mq) {
        this.mq.addEventListener?.('change', this.applyTheme);
      }

      // apply initial
      this.applyTheme();
    },

    setTheme(mode: ThemeMode) {
      this.theme = mode;

      localStorage.setItem(STORAGE_KEY, mode);
      this.applyTheme();
    },

    applyTheme() {
      const systemDark = prefersDark();

      this.isDark = this.theme === 'dark' || (this.theme === 'system' && systemDark);

      const html = document.documentElement;

      html.classList.toggle('dark', this.isDark);
      html.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
    },

    destroy() {
      if (this.mq) {
        this.mq.removeEventListener?.('change', this.applyTheme);
        this.mq = null;
      }

      this.inited = false;
    },
  },
});
