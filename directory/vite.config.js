import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import config from './config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: path.resolve(config.basedir, config.folder.release),
    assetsDir: config.folder.directory,
    emptyOutDir: false,
    rollupOptions: {
      output: {
        manualChunks: {
        },
      }
    }
  },
})
