import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/codequest-platform/',
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@content': new URL('./content', import.meta.url).pathname,
    },
  },
});
