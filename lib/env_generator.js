import path from 'path'

export default class EnvGenerator {
  #config

  constructor(config, operatorName) {
    this.#config = config.operators[operatorName]
  }

  async generate(dimensions) {
    return await this.#promise(dimensions)
  }

  #promise(dimensions) {
    return new Promise((resolve, reject) => {
      resolve([
        `VITE_TITLE="${this.#config.title}"`,
        `VITE_FILENAME=${this.#config.filename.replace('#', '%23')}`,
        `VITE_LOGO_FILENAME=${this.#config.logo}`,
        `VITE_FALLBACK_FILENAME=${this.#config.fallback_name.replace('#', '%23')}`,
        `VITE_VIEWPORT_LEFT=${this.#config.viewport_left}`,
        `VITE_VIEWPORT_RIGHT=${this.#config.viewport_right}`,
        `VITE_VIEWPORT_TOP=${this.#config.viewport_top}`,
        `VITE_VIEWPORT_BOTTOM=${this.#config.viewport_bottom}`,
        `VITE_INVERT_FILTER=${this.#config.invert_filter}`,
        `VITE_IMAGE_WIDTH=${dimensions[0]}`,
        `VITE_IMAGE_HEIGHT=${dimensions[1]}`,
      ].join('\n'))
    })
  }

}