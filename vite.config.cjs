// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        game: resolve(__dirname, 'game.html'),
        results: resolve(__dirname, 'results.html'),
        gotoinfinite: resolve(__dirname, 'gotoinfinite.html'),
      },
    },
  },
})