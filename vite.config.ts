import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Auth service calls (more specific pattern first)
      '/api/auth': {
        target: 'http://188.166.240.119:8080',
        changeOrigin: true,
        cookieDomainRewrite: '',
      },
      // Proxy API calls to backend
      '/api': {
        target: 'http://188.166.240.119:8090',
        changeOrigin: true,
        followRedirects: true,
        cookieDomainRewrite: '',
      },
    },
  },
})
