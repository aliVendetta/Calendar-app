import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // Removed conditional cartographer plugin for simplicity
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'client/src'),
      },
      {
        find: '@shared',
        replacement: path.resolve(__dirname, 'shared'),
      },
    ],
  },
  root: path.resolve(__dirname, 'client'),
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      allow: [
        path.resolve(__dirname, 'client'),
        path.resolve(__dirname, 'shared'),
      ],
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/public'),
    emptyOutDir: true,
  },
});
