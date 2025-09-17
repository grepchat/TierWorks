import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Замените имя репозитория при деплое, если будет иное
  base: '/TierWorks/',
})
