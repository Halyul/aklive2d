import path from 'path'
import Matcher from './content_processor.js'
import { read, exists } from './file.js'

export default class ProjectJson {
  #json
  #config
  #operatorName
  #operatorSourceFolder
  #operatorShareFolder
  #assets

  constructor(config, operatorName, __dirname, operatorShareFolder, assets) {
    this.#config = config
    this.#operatorName = operatorName
    this.#operatorSourceFolder = path.join(__dirname, this.#config.folder.operator)
    this.#operatorShareFolder = operatorShareFolder
    this.#assets = assets
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
          ...this.#properties
        }
      },
    }
  }

  get #properties() {
    const properties = [
      {
        key: "notice",
        value: {
          text: "ui_logo_notice",
          type: "textinput",
          "value": "Set FPS target in Settings"
        }
      }, {
        key: "logo",
        value: {
          text: "ui_operator_logo",
          type: "bool",
          value: true
        }
      }, {
        key: "logoimage",
        value: {
          text: "ui_logo_image",
          type: "file",
          value: "",
          condition: "logo.value == true",
        }
      }, {
        key: "logoratio",
        value: {
          text: "ui_logo_ratio",
          type: "slider",
          value: 61.8,
          condition: "logo.value == true",
          fraction: true,
          max: 100,
          min: 0,
          precision: 2,
          step: 0.1,
        }
      }, {
        key: "logoopacity",
        value: {
          text: "ui_logo_opacity",
          type: "slider",
          value: 30,
          condition: "logo.value == true",
          fraction: false,
          max: 100,
          min: 0,
        }
      }, {
        key: "defaultbackground",
        value: {
          text: "ui_default_background",
          type: "combo",
          value: this.#assets.backgrounds[0],
          fraction: false,
          max: 100,
          min: 0,
          options: this.#assets.backgrounds.map((b) => {
            return {
              "label": b,
              "value": b
            }
          })
        }
      }, {
        key: "background",
        value: {
          text: "ui_custom_background",
          type: "file",
          value: "",
        }
      }, {
        key: "position",
        value: {
          text: "ui_position",
          type: "bool",
          value: false,
        }
      }, {
        key: "paddingleft",
        value: {
          text: "ui_position_padding_left",
          type: "slider",
          value: this.#config.operators[this.#operatorName].viewport_left,
          condition: "position.value == true",
          fraction: false,
          max: 100,
          min: -100,
        }
      }, {
        key: "paddingright",
        value: {
          text: "ui_position_padding_right",
          type: "slider",
          value: this.#config.operators[this.#operatorName].viewport_right,
          condition: "position.value == true",
          fraction: false,
          max: 100,
          min: -100,
        }
      }, {
        key: "paddingtop",
        value: {
          text: "ui_position_padding_top",
          type: "slider",
          value: this.#config.operators[this.#operatorName].viewport_top,
          condition: "position.value == true",
          fraction: false,
          max: 100,
          min: -100,
        }
      }, {
        key: "paddingbottom",
        value: {
          text: "ui_position_padding_bottom",
          type: "slider",
          value: this.#config.operators[this.#operatorName].viewport_bottom,
          condition: "position.value == true",
          fraction: false,
          max: 100,
          min: -100,
        }
      }
    ]
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