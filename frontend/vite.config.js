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
    
    allowedHosts: [
      ".ngrok-free.app"
      // "4985c1c10c48.ngrok-free.app"
    ]
  },
  resolve: {
    alias: {
      // Menetapkan '@' sebagai alias untuk direktori '/src'
      '@': path.resolve(__dirname, './src'), 
    },
  },
})
