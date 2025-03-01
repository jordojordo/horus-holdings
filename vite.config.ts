import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
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
