import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // dữ liệu nền và bộ đọc Sheet dùng chung với Worker
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    // /api/* do Worker phục vụ — chạy song song `npx wrangler dev` ở cổng 8787
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
})
