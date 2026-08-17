import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('src/graphics/')) {
            return 'graphics-engine';
          }
          if (id.includes('src/engine/audio') || id.includes('src/engine/SoundEngine')) {
            return 'audio-engine';
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
