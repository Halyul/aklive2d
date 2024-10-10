/* eslint-disable no-undef */
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import assert from 'assert'
import react from '@vitejs/plugin-react-swc'
import getConfig from './libs/config.js'
import { rmdir } from './libs/file.js'
import Music from './libs/music.js';
import Background from './libs/background.js'
import directory from './libs/directory.js'
import OfficalInfo from './libs/offical_info.js';

global.__projectRoot = path.dirname(fileURLToPath(import.meta.url))

class ViteRunner {
  #officalInfo = new OfficalInfo()
  #globalConfig = getConfig(this.#officalInfo)
  #mode
  #baseViteConfig = {
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
    const runType = temp[0]
    this.#mode = temp[1]
    switch (runType) {
      case 'directory':
        result = {
          data: this.#directoryConfig,
        }
        if (this.#mode !== 'preview') {
          rmdir(path.resolve(__projectRoot, this.#globalConfig.folder.release, "_directory"))
          rmdir(path.resolve(__projectRoot, this.#globalConfig.folder.release, "index.html"))
        }
        break
      case 'operator':
        result = {
          data: this.#operatorConfig,
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
      root: path.resolve(__projectRoot, this.#globalConfig.folder.showcase_src),
      server: {
        ...this.#baseViteConfig.server,
      },
      resolve: {
        alias: {
          '@': path.resolve(__projectRoot, this.#globalConfig.folder.showcase_src, './src'),
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
    if (process.env.npm_lifecycle_event === 'directory:build') {
      global.__config = this.#globalConfig
    }
    const directoryDir = path.resolve(__projectRoot, this.#globalConfig.folder.directory_src)
    const assetsDir = '_directory'
    return {
      ...this.#baseViteConfig,
      envDir: directoryDir,
      base: "/",
      plugins: [
        react(),
      ],
      publicDir: path.resolve(__projectRoot, this.#globalConfig.folder.release),
      root: directoryDir,
      server: {
        ...this.#baseViteConfig.server,
      },
      resolve: {
        alias: {
          '@': path.resolve(directoryDir, './src'),
          '!': path.resolve(__projectRoot, this.#globalConfig.folder.showcase_src, './src'),
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
  if (process.env.npm_lifecycle_event.includes('directory')) return;
  const runner = new ViteRunner()
  await runner.start()
}

main()

export default defineConfig(async () => {
  if (process.env.npm_lifecycle_event.includes('directory')) {
    const officalInfo = new OfficalInfo()
    global.__config = getConfig(officalInfo)
    const OPERATOR_SOURCE_FOLDER = path.join(__projectRoot, __config.folder.operator)
    const OPERATOR_SOURCE_DATA_FOLDER = path.join(__projectRoot, __config.folder.operator_data)
    const OPERATOR_SHARE_FOLDER = path.join(OPERATOR_SOURCE_DATA_FOLDER, __config.folder.share)
    const background = new Background(OPERATOR_SHARE_FOLDER, OPERATOR_SOURCE_FOLDER)
    await background.process()
    const backgrounds = ['operator_bg.png', ...background.files]
    const { musicMapping } = (new Music()).copy(OPERATOR_SHARE_FOLDER)

    directory(OPERATOR_SOURCE_DATA_FOLDER, { backgrounds, musicMapping })
  }
  return (new ViteRunner()).config.data
})