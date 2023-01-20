export default class EnvGenerator {
  #config
  #assets
  #operatorConfig

  constructor(config, operatorName, assets) {
    this.#config = config
    this.#operatorConfig = config.operators[operatorName]
    this.#assets = assets
  }

  generate() {
    return [
      `VITE_TITLE="${this.#operatorConfig.title}"`,
      `VITE_FILENAME=${this.#operatorConfig.filename.replace('#', '%23')}`,
      `VITE_LOGO_FILENAME=${this.#operatorConfig.logo}`,
      `VITE_FALLBACK_FILENAME=${this.#operatorConfig.fallback_name.replace('#', '%23')}`,
      `VITE_VIEWPORT_LEFT=${this.#operatorConfig.viewport_left}`,
      `VITE_VIEWPORT_RIGHT=${this.#operatorConfig.viewport_right}`,
      `VITE_VIEWPORT_TOP=${this.#operatorConfig.viewport_top}`,
      `VITE_VIEWPORT_BOTTOM=${this.#operatorConfig.viewport_bottom}`,
      `VITE_INVERT_FILTER=${this.#operatorConfig.invert_filter}`,
      `VITE_IMAGE_WIDTH=2048`,
      `VITE_IMAGE_HEIGHT=2048`,
      `VITE_BACKGROUND_FILES=${JSON.stringify(this.#assets.backgrounds)}`,
      `VITE_BACKGROUND_FOLDER=${this.#config.folder.background}`,
    ].join('\n')
  }

}