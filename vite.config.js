/* eslint-disable no-undef */
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import assert from 'assert'
import react from '@vitejs/plugin-react-swc'
import getConfig from './libs/config.js'
import { rmdir, writeSync } from './libs/file.js'
import { increase } from './libs/version.js'
import EnvGenerator from './libs/env_generator.js'
import directory from './libs/directory.js'
import { PerfseePlugin } from '@perfsee/rollup'

global.__projetRoot = path.dirname(fileURLToPath(import.meta.url))

class ViteRunner {
  #globalConfig = getConfig()
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
    this.#mode = temp[0] === "vite" ? temp[1] : process.argv[2]
    switch (this.#mode) {
      case 'directory':
        result = {
          data: this.#directoryConfig,
          versionDir: path.join(__projetRoot, "directory"),
        }
        const op = temp[2] || process.argv[3]
        if (op !== 'preview') {
          rmdir(path.resolve(__projetRoot, this.#globalConfig.folder.release, "_directory"))
          rmdir(path.resolve(__projetRoot, this.#globalConfig.folder.release, "index.html"))
        }
        break
      case 'dev':
      case 'build':
      case 'build-all':
      case 'preview':
        result = {
          data: this.#operatorConfig,
          versionDir: path.join(__projetRoot),
        }
        break
      default:
        return
    }
    return result
  }

  start() {
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
    return {
      ...this.#baseViteConfig,
      envDir: path.join(__projetRoot, this.#globalConfig.folder.operator, operatorName),
      publicDir: path.resolve(__projetRoot, this.#globalConfig.folder.release, operatorName),
      root: path.resolve(__projetRoot),
      server: {
        ...this.#baseViteConfig.server,
      },
      resolve: {
        alias: {
          '@': path.resolve(__projetRoot, './src'),
          '!': path.resolve(__projetRoot, this.#globalConfig.folder.operator, operatorName),
        },
      },
      build: {
        ...this.#baseViteConfig.build,
        chunkSizeWarningLimit: 10000,
        outDir: path.resolve(__projetRoot, this.#globalConfig.folder.release, operatorName),
      },
    }
  }

  get #directoryConfig() {
    if (process.env.npm_lifecycle_event === 'vite:directory:build') {
      this.#globalConfig.version.directory = increase(path.join(__projetRoot, "directory"))
      global.__config = this.#globalConfig
    }
    const directoryDir = path.resolve(__projetRoot, 'directory')
    writeSync((new EnvGenerator()).generate([
      {
        key: "app_title",
        value: this.#globalConfig.directory.title
      }, {
        key: "app_voice_url",
        value: this.#globalConfig.directory.voice
      }, {
        key: "voice_folders",
        value: JSON.stringify(this.#globalConfig.folder.voice)
      }, {
        key: "directory_folder",
        value: JSON.stringify(this.#globalConfig.folder.directory)
      }
      , {
        key: "background_folder",
        value: JSON.stringify(this.#globalConfig.folder.background)
      }, {
        key: "available_operators",
        value: JSON.stringify(Object.keys(this.#globalConfig.operators))
      }, {
        key: "error_files",
        value: JSON.stringify(this.#globalConfig.directory.error).replace('#', '%23')
      }
    ]), path.join(directoryDir, '.env'))
    this.#mode = process.argv[3]
    const publicDir = path.resolve(__projetRoot, this.#globalConfig.folder.release)
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
      publicDir: path.resolve(__projetRoot, this.#globalConfig.folder.release),
      root: directoryDir,
      server: {
        ...this.#baseViteConfig.server,
      },
      resolve: {
        alias: {
          '@': path.resolve(directoryDir, './src'),
          '!': path.resolve(__projetRoot, './src'),
          '#': path.resolve(publicDir, this.#globalConfig.folder.directory),
        },
      },
      build: {
        ...this.#baseViteConfig.build,
        outDir: path.resolve(__projetRoot, this.#globalConfig.folder.release),
        assetsDir: '_directory',
        rollupOptions: {
          output: {
            manualChunks: {
              'react': ['react', 'react-dom', 'react-router-dom'],
            },
          }
        }
      },
    }
  }
}

async function main() {
  if (process.env.npm_lifecycle_event.includes('vite')) return
  const runner = new ViteRunner()
  runner.start()
}

main()

export default defineConfig((new ViteRunner()).config.data)