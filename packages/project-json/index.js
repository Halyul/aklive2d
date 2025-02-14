import path from 'node:path'
import Matcher from './libs/content_processor.js'
import { yaml, file } from '@aklive2d/libs'
import config from '@aklive2d/config'
import operators, { OPERATOR_SOURCE_FOLDER } from '@aklive2d/operator'
import { files as backgrounds } from "@aklive2d/background"
import { mapping as musics } from "@aklive2d/music"
import { getLangs } from "@aklive2d/charword-table"

const DIST_DIR = path.join(import.meta.dirname, config.dir_name.dist)

export const build = (namesToBuild) => {
  const names = !namesToBuild.length ? Object.keys(operators) : namesToBuild;
  console.log("Generating assets for", names.length, "operators")
  for (const name of names) {
    const { voiceLangs, subtitleLangs } = getLangs(name)
    load(name, {
      backgrounds,
      voiceLangs,
      subtitleLangs,
      music: Object.keys(musics.musicFileMapping)
    })
    file.symlink(path.join(getDefaultPath(name), config.module.project_json.preview_jpg), path.join(getDistDir(name), config.module.project_json.preview_jpg))
  }
}

const getDistDir = (name) => {
  return path.join(DIST_DIR, name)
}

const getDefaultPath = (name) => {
  return path.join(OPERATOR_SOURCE_FOLDER, name)
}

const getPath = (name) => {
    // if exists, do not use the template
    const defaultPath = path.join(getDefaultPath(name), config.module.project_json.project_json)
    if (file.exists(defaultPath)) {
      return defaultPath
    } else {
      return path.join(import.meta.dirname, config.module.project_json.project_json)
    }
}

const process = ({ name, data, template }) => {
  return {
    ...data,
    description: template.description,
    title: operators[name].title,
    general: {
      ...data.general,
      localization: template.localization,
      properties: {
        ...getProperties(template)
      }
    },
  }
}

const getProperties = (template) => {
  const properties = template.properties
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

const load = async (name, assets) => {
  // load json from file
  let data = JSON.parse(await file.read(getPath(name)))
  const matcher = new Matcher('~{', '}', operators[name], {
    ...assets,
    ...(() => {
      const output = {}
      for (const [key, value] of Object.entries(assets)) {
        output[`${key}Options`] = value.map((b) => {
          return {
            "label": b,
            "value": b
          }
        })
      }
      return output
    })()
  })
  const match = {
    identify: value => value.startsWith('!match'),
    tag: '!match',
    resolve(str) {
      matcher.content = str
      return matcher.result
    }
  }
  const template = yaml.read(path.resolve(import.meta.dirname, config.module.project_json.template_yaml), [match])
  data = process({
    name,
    data,
    template
  })
  file.writeSync(JSON.stringify(data, null, 2), path.join(getDistDir(name), config.module.project_json.project_json))
}
