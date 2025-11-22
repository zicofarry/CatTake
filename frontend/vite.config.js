import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path';


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    vueDevTools()
  ],
  server: {
    host: true,
    watch: {
      usePolling: true,
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  resolve: {
    alias: {
      // Menetapkan '@' sebagai alias untuk direktori '/src'
      '@': path.resolve(__dirname, './src'), 
    },
  },
})
