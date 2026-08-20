import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';
// @ts-expect-error - Custom plugin without type declarations
import { createZipPlugin } from './scripts/viteZipPlugin.js';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Repo env files are named `env.<mode>` (no leading dot), so load them into
  // process.env manually — Vite's built-in env loading only recognizes `.env*` files.
  dotenv.config({ path: path.resolve(process.cwd(), `env.${mode}`) });

  return {
    // Served from the /aimi sub-path under the CSM Angular host, so asset URLs
    // and client-side routing must be rooted there instead of the domain root.
    base: '/aimi/',
    plugins: [
      react(),
      // Create zip for both production and development builds (not for dev server)
      ...(mode === 'production' || mode === 'development'
        ? [createZipPlugin({ mode })]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@features': path.resolve(__dirname, './src/features'),
        '@activities': path.resolve(__dirname, './src/features/activities'),
        '@auth': path.resolve(__dirname, './src/features/auth'),
        '@dashboard': path.resolve(__dirname, './src/features/dashboard'),
        '@reports': path.resolve(__dirname, './src/features/reports'),
        '@backup': path.resolve(__dirname, './src/features/backup'),
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    envPrefix: 'AIMI_',
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-mui': ['@mui/material', '@mui/icons-material'],
            'vendor-router': ['react-router-dom'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
