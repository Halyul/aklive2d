import { defineConfig } from 'vite'
import path from 'node:path'
import { has } from '@aklive2d/operator'
import { envParser } from "@aklive2d/libs"
import { vite } from "@aklive2d/helpers"
import * as dirs from "./index.js";

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => {
  let newOutDir = dirs.OUT_DIR;
  if (command === 'serve') {
    const { name } = envParser.parse({
      name: {
        type: "string",
        short: "n",
      }
    })
    if (!name) {
      throw new Error("Please set the operator name.")
    }
    if (!has(name)) {
      throw new Error(`Invalid operator name: ${name}`)
    }
    if (isPreview) {
      newOutDir = path.join(dirs.DIST_DIR, name)
    } else {
      vite.copyShowcaseData(name, {
        dataDir: dirs.DATA_DIR,
        publicAssetsDir: dirs.PUBLIC_ASSETS_DIR
      })
    }
  }
  
  return {
    base: "",
    resolve: {
      alias: {
        '@': path.resolve('./src'),
        '!': dirs.DATA_DIR,
      },
    },
    envDir: dirs.DATA_DIR,
    publicDir: dirs.PUBLIC_DIR,
    build: {
      chunkSizeWarningLimit: 15000,
      outDir: newOutDir,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
          manualChunks: (id) => {
            if (id.includes("charword_table.json")) {
              return "charword_table"; // all other package goes here
            } else if (id.includes("assets.json")) {
              return "assets";
            }
          },
        },
      }
    },
  }
})
