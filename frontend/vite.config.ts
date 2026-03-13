import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite({ target: 'react', autoCodeSplitting: true }), react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    allowedHosts: ['taconnect-local.lbl.gov', 'taconnect.lbl.gov'],
  },
  base: '/',
});
