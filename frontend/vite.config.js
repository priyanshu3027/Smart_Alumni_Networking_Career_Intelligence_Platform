import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_TARGET = env.VITE_API_URL || 'https://smart-alumni-networking-career.onrender.com'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': { target: API_TARGET, changeOrigin: true },
        '/uploads': { target: API_TARGET, changeOrigin: true }
      }
    }
  }
})
