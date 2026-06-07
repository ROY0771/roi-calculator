import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/roi-calculator/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
