import { defineConfig } from 'vite'
import path from 'path'
import getConfig from './libs/config.js'

const data = {
  config: getConfig(__dirname),
  OPERATOR_NAME: process.argv[3],
}

// https://vitejs.dev/config/
export default defineConfig({
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
