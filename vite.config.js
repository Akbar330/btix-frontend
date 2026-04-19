import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://btix-backend-main-58d3hk.free.laravel.cloud/',
        changeOrigin: true,
      },
      '/storage': {
        target: 'https://btix-backend-main-58d3hk.free.laravel.cloud/',
        changeOrigin: true,
      },
    },
  },
})
