// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    host: '0.0.0.0',
    port: 3100,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://192.168.56.1:5000',  // your Express, plain http
        changeOrigin: true,
        secure: false,
      },
    },
  },
})