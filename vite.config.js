
import { defineConfig } from 'vite';
export default defineConfig({
  server: {
    proxy: {
      '/wp-content': {
        target: 'https://kinetic-movements.local',
        changeOrigin: true,
      },
    },
  },
  base: '/museum/', 
});
