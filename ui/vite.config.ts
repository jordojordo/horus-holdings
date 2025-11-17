import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  define:  {
    'process.env.development': JSON.stringify('development'),
    'process.env.production':  JSON.stringify('production'),
  },
  build: {
    commonjsOptions: {
      include: [
        /@kong\/kongponents/,
        /node_modules/
      ]
    },
  },
  server:  {
    proxy: {
      // Proxy only API requests, excluding apiConfig.json
      '^/api(?!Config\\.json)': {
        target:       'http://localhost:5000',
        changeOrigin: true,
        rewrite:      (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: 'http://localhost:5000',
        ws:     true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws:     true
      },
      // Proxy Socket.IO client namespace
      '/client': {
        target: 'http://localhost:5000',
        ws:     true
      }
    },
  }
});
