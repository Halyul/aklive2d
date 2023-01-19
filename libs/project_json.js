import path from 'path'
import Matcher from './content_processor.js'
import { read, exists } from './file.js'

export default class ProjectJson {
  #json
  #config
  #operatorName
  #operatorSourceFolder
  #operatorShareFolder

  constructor(config, operatorName, __dirname, operatorShareFolder) {
    this.#config = config
    this.#operatorName = operatorName
    this.#operatorSourceFolder = path.join(__dirname, this.#config.folder.operator)
    this.#operatorShareFolder = operatorShareFolder
  }
    
  async load() {
    // load json from file
    this.#json = JSON.parse(await read(this.#getPath()))
    this.#process()
    return this.#json
  }

  #getPath() {
    // if exists, do not use the template
    const defaultPath = path.join(this.#operatorSourceFolder, this.#operatorName, 'project.json')
    if (exists(defaultPath)) {
      return defaultPath
    } else {
      return path.join(this.#operatorShareFolder, 'project.json')
    }
  }

  #process() {
    const matcher = new Matcher(this.#json.description, '${', '}', this.#config.operators[this.#operatorName])
    if (matcher.match() !== null) {
      this.#json.description = matcher.process()
    }
    // TODO: move the template generation to here
    this.#json = {
      ...this.#json,
      description: this.#json.description,
      title: this.#config.operators[this.#operatorName].title,
      general: {
        ...this.#json.general,
        properties: {
          ...this.#json.general.properties,
          paddingbottom: {
            ...this.#json.general.properties.paddingbottom,
            value: this.#config.operators[this.#operatorName].viewport_bottom
          },
          paddingleft: {
            ...this.#json.general.properties.paddingleft,
            value: this.#config.operators[this.#operatorName].viewport_left
          },
          paddingright: {
            ...this.#json.general.properties.paddingright,
            value: this.#config.operators[this.#operatorName].viewport_right
          },
          paddingtop: {
            ...this.#json.general.properties.paddingtop,
            value: this.#config.operators[this.#operatorName].viewport_top
          },
        }
      },
    }
  }

}