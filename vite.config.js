import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    target: 'es2020',
    // p5 + Tone.js are large; raise the warning threshold
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Split vendor libs into a separate chunk for better caching
        manualChunks: {
          p5: ['p5'],
          tone: ['tone'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
