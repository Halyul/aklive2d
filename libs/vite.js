import path from 'path'
import { createServer, build } from 'vite'

export default class Vite {

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
      publicDir: path.resolve(__dirname, __config.folder.release, __operator_name),
      root: path.resolve(__dirname),
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '!': path.resolve(__dirname, __config.folder.operator, __operator_name),
          '#': path.resolve(__config.basedir, __config.folder.operator, __operator_name, `${__config.operators[__operator_name].filename}.json`),
        },
      },
      build: {
        outDir: path.resolve(__dirname, __config.folder.release, __operator_name),
        emptyOutDir: false,
        chunkSizeWarningLimit: 10000,
      },
    }
  }

}