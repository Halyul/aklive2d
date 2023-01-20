import path from 'path'
import { createServer, build } from 'vite'

export default class Vite {
  #config
  #rootDir
  #operatorName

  constructor(config, operatorName, rootDir) {
    this.#config = config
    this.#operatorName = operatorName
    this.#rootDir = rootDir
  }

  dev() {
    ; (async () => {
      const server = await createServer(this.#viteConfig)
      await server.listen()

      server.printUrls()
    })()
  }

  async build() {
    await build(this.#viteConfig)
  }

  get #viteConfig() {
    return {
      base: "",
      publicDir: path.resolve(this.#rootDir, this.#config.folder.release, this.#operatorName),
      root: path.resolve(this.#rootDir),
      resolve: {
        alias: {
          '@': path.resolve(this.#rootDir, './src'),
          '!': path.resolve(this.#rootDir, this.#config.folder.operator, this.#operatorName),
          '#': path.resolve(this.#config.basedir, this.#config.folder.operator, this.#operatorName, `${this.#config.operators[this.#operatorName].filename}.json`),
        },
      },
      build: {
        outDir: path.resolve(this.#rootDir, this.#config.folder.release, this.#operatorName),
        emptyOutDir: false,
        chunkSizeWarningLimit: 10000,
      },
    }
  }

}