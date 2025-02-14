import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import config from "@aklive2d/config"
import * as showcaseDirs from "@aklive2d/showcase"
import { vite } from "@aklive2d/helpers"

// https://vite.dev/config/
export default defineConfig(async () => {
  const dataDir = path.resolve(import.meta.dirname, config.dir_name.data)
  const publicDir = path.resolve(showcaseDirs.DIST_DIR)
  await vite.copyDirectoryData({ dataDir, publicDir })
  return {
      envDir: dataDir,
      plugins: [
        react(),
      ],
      publicDir,
      resolve: {
        alias: {
          '@': path.resolve('./src'),
          '!': dataDir,
        },
      },
      build: {
        emptyOutDir: false,
        outDir: publicDir,
        rollupOptions: {
          output: {
            entryFileNames: `${config.directory.assets_dir}/[name]-[hash:8].js`,
            chunkFileNames: `${config.directory.assets_dir}/[name]-[hash:8].js`,
            assetFileNames: `${config.directory.assets_dir}/[name]-[hash:8].[ext]`,
            manualChunks: (id) => {
              if (id.includes("node_modules")) {
                return "vendor"; // all other package goes here
              } else if (id.includes("data") && id.includes(".json")) {
                return "assets";
              }
            },
          }
        }
      },
  }
})
