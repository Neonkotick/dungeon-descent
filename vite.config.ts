import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: { target: 'es2020', outDir: 'dist', assetsDir: 'assets', sourcemap: true },
  server: { host: true, port: 5173 },
});
