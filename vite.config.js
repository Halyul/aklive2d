/* eslint-disable no-undef */
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import assert from 'assert'
import react from '@vitejs/plugin-react-swc'
import getConfig from './libs/config.js'
import { rmdir } from './libs/file.js'
import { increase } from './libs/version.js'
import Music from './libs/music.js';
import Background from './libs/background.js'
import directory from './libs/directory.js'
import { PerfseePlugin } from '@perfsee/rollup'

global.__projectRoot = path.dirname(fileURLToPath(import.meta.url))

class ViteRunner {
  #globalConfig = getConfig()
  #mode
  #baseViteConfig = {
    plugins: [splitVendorChunkPlugin()],
    configFile: false,
    base: "",
    server: {
      host: '0.0.0.0',
    },
    build: {
      emptyOutDir: false,
    },
  }

  get config() {
    let result;
    const temp = process.env.npm_lifecycle_event.split(':')
    this.#mode = temp[0] === "vite" ? temp[1] : process.argv[2]
    switch (this.#mode) {
      case 'directory':
        result = {
          data: this.#directoryConfig,
          versionDir: path.join(__projectRoot, "directory"),
        }
        const op = temp[2] || process.argv[3]
        if (op !== 'preview') {
          rmdir(path.resolve(__projectRoot, this.#globalConfig.folder.release, "_directory"))
          rmdir(path.resolve(__projectRoot, this.#globalConfig.folder.release, "index.html"))
        }
        break
      case 'dev':
      case 'build':
      case 'build-all':
      case 'preview':
        result = {
          data: this.#operatorConfig,
          versionDir: path.join(__projectRoot),
        }
        break
      default:
        return null
    }
    return result
  }

  async start() {
    const configObj = this.config
    const viteConfig = configObj.data;

    switch (this.#mode) {
      case 'dev':
        this.#dev(viteConfig)
        break
      case 'build':
        this.#globalConfig.version.showcase = increase(configObj.versionDir)
      case 'build-all':
        this.#build(viteConfig)
        break
      case 'preview':
        this.#preview(viteConfig)
        break
      default:
        return
    }
  }

  #dev(viteConfig) {
    ; (async () => {
      const { createServer } = await import('vite')
      const server = await createServer(viteConfig)
      await server.listen()

      server.printUrls()
    })()
  }

  #build(viteConfig) {
    ; (async () => {
      const { build } = await import('vite')
      await build({
        ...viteConfig,
        logLevel: 'silent',
      })
    })()
  }

  #preview(viteConfig) {
    ; (async () => {
      const { preview } = await import('vite')
      const previewServer = await preview({
        ...viteConfig,
      })

      previewServer.printUrls()
    })()
  }

  get #operatorConfig() {
    const operatorName = process.env.O || process.argv[3]
    assert(operatorName, 'Please set the operator name by using environment variable O.')
    const assetsDir = 'assets'
    return {
      ...this.#baseViteConfig,
      envDir: path.join(__projectRoot, this.#globalConfig.folder.operator, operatorName),
      publicDir: path.resolve(__projectRoot, this.#globalConfig.folder.release, operatorName),
      root: path.resolve(__projectRoot),
      server: {
        ...this.#baseViteConfig.server,
      },
      resolve: {
        alias: {
          '@': path.resolve(__projectRoot, './src'),
          '!': path.resolve(__projectRoot, this.#globalConfig.folder.operator, operatorName),
        },
      },
      build: {
        ...this.#baseViteConfig.build,
        chunkSizeWarningLimit: 10000,
        outDir: path.resolve(__projectRoot, this.#globalConfig.folder.release, operatorName),
        rollupOptions: {
          output: {
            entryFileNames: `${assetsDir}/[name].js`,
            chunkFileNames: `${assetsDir}/[name].js`,
            assetFileNames: `${assetsDir}/[name].[ext]`,
          }
        }
      },
    }
  }

  get #directoryConfig() {
    if (process.env.npm_lifecycle_event === 'vite:directory:build') {
      this.#globalConfig.version.directory = increase(path.join(__projectRoot, "directory"))
      global.__config = this.#globalConfig
    }
    const directoryDir = path.resolve(__projectRoot, 'directory')
    this.#mode = process.argv[3]
    // const publicDir = path.resolve(__projectRoot, this.#globalConfig.folder.release)
    const assetsDir = '_directory'
    return {
      ...this.#baseViteConfig,
      envDir: directoryDir,
      base: "/",
      plugins: [
        react(),
        // PerfseePlugin({
        //   project: 'aklive2d',
        //   artifactName: 'directory',
        // }),
      ],
      publicDir: path.resolve(__projectRoot, this.#globalConfig.folder.release),
      root: directoryDir,
      server: {
        ...this.#baseViteConfig.server,
      },
      resolve: {
        alias: {
          '@': path.resolve(directoryDir, './src'),
          '!': path.resolve(__projectRoot, './src'),
        },
      },
      build: {
        ...this.#baseViteConfig.build,
        outDir: path.resolve(__projectRoot, this.#globalConfig.folder.release),
        rollupOptions: {
          output: {
            entryFileNames: `${assetsDir}/[name]-[hash:8].js`,
            chunkFileNames: `${assetsDir}/[name]-[hash:8].js`,
            assetFileNames: `${assetsDir}/[name]-[hash:8].[ext]`,
            manualChunks: (id) => {
              if (id.includes("node_modules")) {
                return "vendor"; // all other package goes here
              } else if (id.includes("directory/src") && id.includes(".json")) {
                return "assets";
              }
            },
          }
        }
      },
    }
  }
}

async function main() {
  if (process.env.npm_lifecycle_event.includes('vite')) {
    global.__config = getConfig()
    const background = new Background()
    await background.process()
    const backgrounds = ['operator_bg.png', ...background.files]
    const { musicMapping } = (new Music()).copy()

    directory({ backgrounds, musicMapping })
    return
  }
  const runner = new ViteRunner()
  await runner.start()
}

main()

export default defineConfig((new ViteRunner()).config.data)