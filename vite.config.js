import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import assert from 'assert'
import react from '@vitejs/plugin-react-swc'
import getConfig from './libs/config.js'

global.__projetRoot = path.dirname(fileURLToPath(import.meta.url))

class ViteRunner {
  #globalConfig = getConfig()
  #mode
  #baseViteConfig = {}

  config() {
    let result;
    const temp = process.env.npm_lifecycle_event.split(':')
    this.#mode = temp[0] === "vite" ? temp[1] : process.argv[2]
    switch (this.#mode) {
      case 'directory':
        result = this.directory()
        break
      case 'dev':
      case 'build':
      case 'build-all':
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

  operator() {
    const operatorName = process.env.O || process.argv[3]
    assert(operatorName, 'Please set the operator name by using environment variable O.')
    return {
      configFile: false,
      base: "",
      envDir: path.join(__projetRoot, this.#globalConfig.folder.operator, operatorName),
      publicDir: path.resolve(__projetRoot, this.#globalConfig.folder.release, operatorName),
      root: path.resolve(__projetRoot),
      server: {
        host: '0.0.0.0',
      },
      resolve: {
        alias: {
          '@': path.resolve(__projetRoot, './src'),
          '!': path.resolve(__projetRoot, this.#globalConfig.folder.operator, operatorName),
        },
      },
      build: {
        outDir: path.resolve(__projetRoot, this.#globalConfig.folder.release, operatorName),
        emptyOutDir: false,
        chunkSizeWarningLimit: 10000,
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
          '!': path.resolve(__projetRoot, this.#globalConfig.folder.release, this.#globalConfig.folder.directory),
        },
      },
      build: {
        outDir: path.resolve(__projetRoot, this.#globalConfig.folder.release),
        emptyOutDir: false,
        chunkSizeWarningLimit: 10000,
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