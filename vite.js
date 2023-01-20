import path from 'path'
import { fileURLToPath } from 'url'
import { createServer, build, loadEnv } from 'vite'
import getConfig from './libs/config.js'
import { rm } from './libs/file.js'

global.__dirname = path.dirname(fileURLToPath(import.meta.url))

export default class Vite {
  #operatorName = process.argv[3]
  #config = getConfig()

  dev() {
    ; (async () => {
      this.#loadEnvFromEnvFile('development')
      const server = await createServer(this.#viteConfig)
      await server.listen()

      server.printUrls()
    })()
  }

  build() {
    ; (async () => {
      this.#loadEnvFromEnvFile('production')
      console.log("Building", this.#operatorName, "...")
      await build({
        ...this.#viteConfig,
        logLevel: 'silent',
      })
    })()
    
  }

  #loadEnvFromEnvFile(mode) {
    const envPath = path.join(__dirname, this.#config.folder.operator, this.#operatorName)
    process.env = { ...loadEnv(mode, envPath) }
    rm(path.join(envPath, '.env'))
  }

  get #viteConfig() {
    return {
      base: "",
      publicDir: path.resolve(__dirname, this.#config.folder.release, this.#operatorName),
      root: path.resolve(__dirname),
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '!': path.resolve(__dirname, this.#config.folder.operator, this.#operatorName),
          '#': path.resolve(__dirname, this.#config.folder.operator, this.#operatorName, `${this.#config.operators[this.#operatorName].filename}.json`),
        },
      },
      build: {
        outDir: path.resolve(__dirname, this.#config.folder.release, this.#operatorName),
        emptyOutDir: false,
        chunkSizeWarningLimit: 10000,
      },
    }
  }

}

function main() {
  const MODE = process.argv[2]
  const vite = new Vite()

  switch (MODE) {
    case 'dev':
      vite.dev()
      break
    case 'build':
    case 'build-all':
      vite.build()
      break
    default:
      break
  }
}

main()