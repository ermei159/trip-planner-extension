import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: '../extension/app',
    emptyOutDir: true,
  },
});
