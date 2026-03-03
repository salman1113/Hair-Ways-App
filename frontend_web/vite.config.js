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
        target: 'ws://hairways-alb-2028882098.ap-south-1.elb.amazonaws.com',
        ws: true,
      },
      '/api/': {
        target: 'http://hairways-alb-2028882098.ap-south-1.elb.amazonaws.com',
      }
    }
  }
})
