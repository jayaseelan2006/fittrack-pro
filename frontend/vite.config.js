import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, /api is proxied to the FastAPI server. In production Nginx does the routing.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: { output: { manualChunks: { charts: ['recharts'], vendor: ['react', 'react-dom', 'react-router-dom', 'axios'] } } },
  },
  test: { environment: 'jsdom', include: ['tests/**/*.test.jsx'] },
  server: {
    port: 5173,
    proxy: { '/api': { target: process.env.VITE_PROXY_TARGET || 'http://localhost:8000', changeOrigin: true } },
  },
});
