import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      // The Spring Boot API has no CORS config, so the dev server proxies /api to it.
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8081',
          changeOrigin: true,
        },
      },
    },
  };
});
