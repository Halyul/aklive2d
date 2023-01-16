import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import path from 'path'
import data from './preprocessing'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  base: "",
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '!': path.resolve(data.config.basedir, data.config.folder.operator, data.OPERATOR_NAME),
      '#': path.resolve(data.config.basedir, data.config.folder.operator, data.OPERATOR_NAME, `${data.config.operators[data.OPERATOR_NAME].filename}.json`),
    },
  },
  build: {
    outDir: path.resolve(data.config.basedir, data.config.folder.release, data.OPERATOR_NAME),
    emptyOutDir: false,
    chunkSizeWarningLimit: 10000,
  },
})
