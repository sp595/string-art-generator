import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize bundle size with esbuild (faster than terser)
    minify: 'esbuild',
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // Generate source maps for production debugging
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    // Remove console and debugger in production
    drop: ['console', 'debugger'],
  },
  // Performance optimizations
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
})
