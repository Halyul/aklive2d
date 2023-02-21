import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import assert from 'assert'
import react from '@vitejs/plugin-react-swc'
import getConfig from './libs/config.js'
import { rmdir } from './libs/file.js'

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

  config() {
    let result;
    const temp = process.env.npm_lifecycle_event.split(':')
    this.#mode = temp[0] === "vite" ? temp[1] : process.argv[2]
    switch (this.#mode) {
      case 'directory':
        result = this.directory()
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
        result = this.operator()
        break
      default:
        return
    }
    return result
  }

  async start() {
    const viteConfig = this.config();
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

  operator() {
    const operatorName = process.env.O || process.argv[3]
    assert(operatorName, 'Please set the operator name by using environment variable O.')
    return {
      ...this.#baseViteConfig,
      envDir: path.join(__projetRoot, this.#globalConfig.folder.operator, operatorName),
      publicDir: path.resolve(__projetRoot, this.#globalConfig.folder.release, operatorName),
      root: path.resolve(__projetRoot),
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

  directory() {
    const directoryDir = path.resolve(__projetRoot, 'directory')
    this.#mode = process.argv[3]
    return {
      configFile: false,
      base: "",
      envDir: directoryDir,
      plugins: [react()],
      publicDir: path.resolve(__projetRoot, this.#globalConfig.folder.release),
      root: directoryDir,
      server: {
        host: '0.0.0.0',
      },
      resolve: {
        alias: {
          '@': path.resolve(directoryDir, './src'),
        },
      },
      build: {
        ...this.#baseViteConfig.build,
        outDir: path.resolve(__projetRoot, this.#globalConfig.folder.release),
        assetsDir: '_directory',
        rollupOptions: {
          output: {
            manualChunks: {
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
  await runner.start()
}

main()

export default defineConfig((new ViteRunner()).config())