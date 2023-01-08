import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  base: "",
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'logo': path.resolve(__dirname, `./src/assets/logo_rhodes_override.png`), // TODO: use env
      'fallback': path.resolve(__dirname, `./src/assets/char_1013_chen2_2.png`), // TODO
    },
  },
  build: {
    chunkSizeWarningLimit: 10000,
  //   outDir: path.resolve(config.basedir, config.server.release_folder),
  },
})
