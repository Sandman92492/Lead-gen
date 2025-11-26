import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // Optimize for production
    minify: 'esbuild',
    sourcemap: false,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
})
