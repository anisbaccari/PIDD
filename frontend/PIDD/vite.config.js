import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // --- AJOUTEZ CETTE SECTION ---
  server: {
    allowedHosts: [
      'unexcessively-ceratoid-martha.ngrok-free.dev'
    ]
  }
})