import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Kongponents from '@kong/kongponents';

import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { useSocketStore } from '@/stores/socket';

import '@/assets/styles/main.css';
import '@kong/kongponents/dist/style.css';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(Kongponents);

const theme = useThemeStore();

theme.init();

const auth = useAuthStore();

auth.bootFromStorage();

const socket = useSocketStore();

socket.init(router);

app.mount('#app');
