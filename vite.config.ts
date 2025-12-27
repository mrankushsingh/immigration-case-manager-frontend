import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
  })],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Ensure react-vendor loads first by making it a dependency
        manualChunks: (id) => {
          // Vendor chunks - split by library type
          if (id.includes('node_modules')) {
            // React core libraries - MUST be in the same chunk for recharts to work
            // This chunk loads FIRST to ensure React is available globally
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // recharts MUST be in the same chunk as React to access React.forwardRef
            if (id.includes('recharts')) {
              return 'react-vendor';
            }
            // Lucide icons - also needs React, put in react-vendor to ensure React is available
            if (id.includes('lucide-react')) {
              return 'react-vendor';
            }
            // jszip might be used with React components, put in react-vendor to be safe
            if (id.includes('jszip')) {
              return 'react-vendor';
            }
            // Firebase (large SDK) - doesn't need React, separate chunk
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // Put ALL other vendor libraries in react-vendor to ensure React is available
            // This prevents "Cannot read properties of undefined" errors
            return 'react-vendor';
          }
          
          // Large component chunks - split by feature
          if (id.includes('Dashboard.tsx')) {
            return 'dashboard';
          }
          if (id.includes('ClientDetailsModal.tsx')) {
            return 'client-details';
          }
          
          // Modal components
          if (id.includes('CreateClientModal') || id.includes('CreateTemplateModal')) {
            return 'modals';
          }
          
          // Utils chunks
          if (id.includes('utils/api.ts') || id.includes('utils/firebase.ts')) {
            return 'utils';
          }
          
          // Other components (smaller ones can be grouped)
          if (id.includes('components/')) {
            return 'components';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Increase limit to 1MB
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: [
      '.loca.lt',
      'localhost',
      '127.0.0.1'
    ],
    hmr: {
      clientPort: 5173
    },
    // Proxy API requests to backend during development
    // In production, set VITE_API_URL environment variable to your backend URL
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      '.railway.app',
      '.up.railway.app',
      'localhost',
      '127.0.0.1'
    ]
  }
})
