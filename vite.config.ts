import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          react: ['react', 'react-dom'],
          vendor: ['zustand', 'howler']
        }
      }
    },
    target: 'esnext'
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['phaser', 'react', 'react-dom', 'zustand', 'howler']
  }
})
