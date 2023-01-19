export default class EnvGenerator {
  #config
  #assets

  constructor(config, operatorName, assets) {
    this.#config = config.operators[operatorName]
    this.#assets = assets
  }

  async generate() {
    return await this.#promise()
  }

  #promise() {
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
        `VITE_IMAGE_WIDTH=2048`,
        `VITE_IMAGE_HEIGHT=2048`,
        `VITE_BACKGROUND_FILES=${JSON.stringify(this.#assets.backgrounds)}`,
      ].join('\n'))
    })
  }

}