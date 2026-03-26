import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: false,
  build: {
    outDir: '../dist',
  },
  test: {
    include: ['../tests/unit/**/*.test.js'],
  },
});
