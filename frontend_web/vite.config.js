import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/ws/': {
        target: 'wss://api.hairways.in',
        ws: true,
      },
      '/api/': {
        target: 'https://api.hairways.in',
      }
    }
  }
})
