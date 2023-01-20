import assert from 'assert'
import path from 'path'
import { fileURLToPath } from 'url'
import getConfig from './libs/config.js'
import ProjectJson from './libs/project_json.js'
import EnvGenerator from './libs/env_generator.js'
import { write, rmdir, copy, writeSync, rm } from './libs/file.js'
import AssetsProcessor from './libs/assets_processor.js'
import init from './libs/initializer.js'
import directory from './libs/directory.js'
import Vite from './libs/vite.js'
import { appendReadme } from './libs/append.js'
import Background from './libs/background.js'

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const config = getConfig(__dirname)

  const op = process.argv[2]
  let OPERATOR_NAMES = process.argv.slice(3);

  const background = new Background(config, __dirname)
  await background.process()
  const backgrounds = ['operator_bg.png', ...background.files]

  directory(config, __dirname)

  /**
   * Skip all, no need for OPERATOR_NAME
   * build-all: build all assets
   * directory: build directory.json
   */
  switch (op) {
    case 'directory':
      process.exit(0)
    case 'build-all':
      for (const [key, _] of Object.entries(config.operators)) {
        OPERATOR_NAMES.push(key)
      }
    default:
      break
  }

  assert(OPERATOR_NAMES.length !== 0, 'Please set the operator name.')

  for (const OPERATOR_NAME of OPERATOR_NAMES) {
    const OPERATOR_SOURCE_FOLDER = path.join(__dirname, config.folder.operator)
    const OPERATOR_RELEASE_FOLDER = path.join(__dirname, config.folder.release, OPERATOR_NAME)
    const SHOWCASE_PUBLIC_ASSSETS_FOLDER = path.join(OPERATOR_RELEASE_FOLDER, "assets")
    const EXTRACTED_FOLDER = path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, 'extracted')
    const OPERATOR_SHARE_FOLDER = path.join(OPERATOR_SOURCE_FOLDER, '_share')

    /**
     * Skip assets generation part
     * init: init folder and config for an operator
     * readme: append a new line to README.md
     */
    switch (op) {
      case 'init':
        init(OPERATOR_NAME, __dirname, EXTRACTED_FOLDER)
        process.exit(0)
      case 'readme':
        appendReadme(config, OPERATOR_NAME, __dirname)
        process.exit(0)
      default:
        break
    }

    rmdir(OPERATOR_RELEASE_FOLDER)

    const projectJson = new ProjectJson(config, OPERATOR_NAME, __dirname, OPERATOR_SHARE_FOLDER, {
      backgrounds
    })
    projectJson.load().then((content) => {
      write(JSON.stringify(content, null, 2), path.join(OPERATOR_RELEASE_FOLDER, 'project.json'))
    })

    const assetsProcessor = new AssetsProcessor(config, OPERATOR_NAME, __dirname)
    assetsProcessor.process(SHOWCASE_PUBLIC_ASSSETS_FOLDER, EXTRACTED_FOLDER).then((content) => {
      write(JSON.stringify(content.assetsJson, null), path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, `${config.operators[OPERATOR_NAME].filename}.json`))
    })

    const filesToCopy = [
      ...background.getFilesToCopy(SHOWCASE_PUBLIC_ASSSETS_FOLDER),
      {
        filename: 'preview.jpg',
        source: path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME),
        target: path.join(OPERATOR_RELEASE_FOLDER)
      },
      {
        filename: 'operator_bg.png',
        source: path.join(OPERATOR_SHARE_FOLDER, config.folder.background),
        target: path.join(SHOWCASE_PUBLIC_ASSSETS_FOLDER, config.folder.background)
      },
      {
        filename: `${config.operators[OPERATOR_NAME].logo}.png`,
        source: path.join(OPERATOR_SHARE_FOLDER, 'logo'),
        target: path.join(SHOWCASE_PUBLIC_ASSSETS_FOLDER)
      },
      {
        filename: `${config.operators[OPERATOR_NAME].fallback_name}.png`,
        source: path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME),
        target: path.join(SHOWCASE_PUBLIC_ASSSETS_FOLDER)
      },
    ]
    filesToCopy.forEach((file) => {
      copy(path.join(file.source, file.filename), path.join(file.target, file.filename))
    })

    const envPath = path.join(__dirname, '.env')
    writeSync((new EnvGenerator(config, OPERATOR_NAME, {
      backgrounds
    })).generate(), envPath)
    /**
      * dev: run dev server
      * build: build assets
      */
    const vite = new Vite(config, OPERATOR_NAME, __dirname)
    switch (op) {
      case 'dev':
        vite.dev()
        break
      case 'build':
      case 'build-all':
        await vite.build()
        rm(envPath)
        break
      default:
        break
    }
  }
}

main();