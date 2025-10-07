import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize bundle size with esbuild (faster than terser)
    minify: 'esbuild',
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
        // Optimize chunk loading
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Generate source maps for production debugging
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
    // Inline small assets as base64
    assetsInlineLimit: 4096,
  },
  esbuild: {
    // Remove console and debugger in production
    drop: ['console', 'debugger'],
    legalComments: 'none',
  },
  // Performance optimizations
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
})
