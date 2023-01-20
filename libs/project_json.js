import path from 'path'
import Matcher from './content_processor.js'
import { read as readFile, exists } from './file.js'
import { read as readYAML } from './yaml.js'

export default class ProjectJson {
  #json
  #config
  #operatorName
  #operatorSourceFolder
  #operatorShareFolder
  #assets
  #rootDir
  #template

  constructor(config, operatorName, __dirname, operatorShareFolder, assets) {
    this.#config = config
    this.#operatorName = operatorName
    this.#operatorSourceFolder = path.join(__dirname, this.#config.folder.operator)
    this.#operatorShareFolder = operatorShareFolder
    this.#assets = assets
    this.#rootDir = __dirname
    this.#template = this.#processYAML(readYAML(path.join(this.#rootDir, 'config', '_project_json.yaml')))
  }
    
  async load() {
    // load json from file
    this.#json = JSON.parse(await readFile(this.#getPath()))
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
      title: this.#config.operators[this.#operatorName].title,
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

  #processYAML(template) {
    const matcher = new Matcher(template.description, '${', '}', this.#config.operators[this.#operatorName])
    if (matcher.match() !== null) {
      template.description = matcher.process()
    }
    const replacePropertyPairs = [
      {
        key: "defaultbackground",
        value: {
          value: this.#assets.backgrounds[0],
          options: this.#assets.backgrounds.map((b) => {
            return {
              "label": b,
              "value": b
            }
          })
        }
      },
      {
        key: "paddingleft",
        value: {
          value: this.#config.operators[this.#operatorName].viewport_left
        },
      },
      {
        key: "paddingright",
        value: {
          value: this.#config.operators[this.#operatorName].viewport_right
        },
      },
      {
        key: "paddingtop",
        value: {
          value: this.#config.operators[this.#operatorName].viewport_top
        },
      },
      {
        key: "paddingbottom",
        value: {
          value: this.#config.operators[this.#operatorName].viewport_bottom
        },
      },
    ]
    replacePropertyPairs.forEach((pair) => {
      const property = template.properties.find((p) => p.key === pair.key)
      property.value = {
        ...property.value,
        ...pair.value
      }
    })
    return template
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