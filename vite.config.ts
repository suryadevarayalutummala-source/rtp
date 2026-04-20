import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY ?? env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/server/data/**', '**/public/predictions/**'],
      },
      proxy: {
        '/api/yahoo-finance': {
          target: 'https://query1.finance.yahoo.com',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/yahoo-finance/, ''),
          secure: true,
        },
        '/api/yahoo-search': {
          target: 'https://query2.finance.yahoo.com',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/yahoo-search/, ''),
          secure: true,
        },
        '/api/yahoo-quote': {
          target: 'https://query1.finance.yahoo.com',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/yahoo-quote/, ''),
          secure: true,
        },
        '/api/predict': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
