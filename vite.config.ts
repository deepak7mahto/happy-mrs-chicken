import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/pixi.js')) {
            return 'vendor-pixi';
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

