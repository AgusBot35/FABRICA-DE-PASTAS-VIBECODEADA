import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Solo se usa si corrés `npm run dev` por separado (puerto 5173).
    // Hace que las llamadas a /api/... se reenvíen al backend en :8000,
    // evitando problemas de CORS en desarrollo.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
