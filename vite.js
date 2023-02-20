import path from 'path'
import { fileURLToPath } from 'url'
import { createServer, build, loadEnv } from 'vite'
import getConfig from './libs/config.js'
import { rm } from './libs/file.js'

global.__projetRoot = path.dirname(fileURLToPath(import.meta.url))
const MODE = process.argv[2]

export default class Vite {
  #globalConfig = getConfig()

  async start() {
    let result;
    switch (MODE) {
      case 'dev':
      case 'build':
      case 'build-all':
        result = this.operator()
        break
      case 'directory':
        result = await this.directory()
        break
      default:
        return
    }
    const mode = result.mode
    const envPath = result.envPath
    const viteConfig = result.viteConfig
    switch (mode) {
      case 'dev':
        this.#dev(envPath, viteConfig)
        break
      case 'build':
      case 'build-all':
        this.#build(envPath, viteConfig)
        break
      default:
        break
    }
  }

  #dev(envPath, viteConfig) {
    ; (async () => {
      this.#loadEnvFromEnvFile('development', envPath)
      const server = await createServer(viteConfig)
      await server.listen()

      server.printUrls()
    })()
  }

  #build(envPath, viteConfig) {
    ; (async () => {
      this.#loadEnvFromEnvFile('production', envPath)
      await build({
        ...viteConfig,
        logLevel: 'silent',
      })
    })()
  }

  operator() {
    const operatorName = process.argv[3]
    const viteConfig = {
      base: "",
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
    const envPath = path.join(__projetRoot, this.#globalConfig.folder.operator, operatorName)
    return {
      mode: MODE,
      envPath,
      viteConfig
    }
  }

  async directory() {
    const { default: react } = await import('@vitejs/plugin-react-swc')
    const directoryDir = path.resolve(__projetRoot, 'directory')
    const mode = process.argv[3]
    const viteConfig = {
      base: "",
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
    const envPath = directoryDir
    return {
      mode,
      envPath,
      viteConfig
    }
  }

  #loadEnvFromEnvFile(mode, envPath) {
    process.env = { ...loadEnv(mode, envPath) }
    rm(path.join(envPath, '.env'))
  }

}

async function main() {
  const vite = new Vite()
  await vite.start()
}

main()