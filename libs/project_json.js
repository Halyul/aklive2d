import path from 'path'
import Matcher from './content_processor.js'
import { read as readFile, exists } from './file.js'
import { read as readYAML } from './yaml.js'

export default class ProjectJson {
  #json
  #operatorName
  #operatorSourceFolder
  #operatorShareFolder
  #assets
  #template

  constructor(operatorName, operatorShareFolder, assets) {
    this.#operatorName = operatorName
    this.#operatorSourceFolder = path.join(__dirname, __config.folder.operator)
    this.#operatorShareFolder = operatorShareFolder
    this.#assets = assets
  }
    
  async load() {
    // load json from file
    this.#json = JSON.parse(await readFile(this.#getPath()))
    const matcher = new Matcher('${', '}', __config.operators[this.#operatorName], {
      ...this.#assets,
      backgroundOptions: this.#assets.backgrounds.map((b) => {
        return {
          "label": b,
          "value": b
        }
      })
    })
    const match = {
      identify: value => value.startsWith('!match'),
      tag: '!match',
      resolve(str) {
        matcher.content = str
        return matcher.result
      }
    }
    this.#template = readYAML(path.join(__dirname, 'config', '_project_json.yaml'), [match])
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
    this.#json = {
      ...this.#json,
      description: this.#template.description,
      title: __config.operators[this.#operatorName].title,
      general: {
        ...this.#json.general,
        localization: this.#template.localization,
        properties: {
          ...this.#json.general.properties,
          ...this.#properties
        }
      },
    }
  }

  get #properties() {
    const properties = this.#template.properties
    const output = {}
    for (let i = 0; i < properties.length; i++) {
      output[properties[i].key] = {
        index: i,
        order: 100 + i,
        ...properties[i].value
      }
    }
    return output
  }
}