import assert from 'assert'
import path from 'path'
import { fileURLToPath } from 'url'
import { fork } from 'child_process';
import getConfig from './libs/config.js'
import ProjectJson from './libs/project_json.js'
import EnvGenerator from './libs/env_generator.js'
import { write, rmdir, copy, writeSync } from './libs/file.js'
import AssetsProcessor from './libs/assets_processor.js'
import init from './libs/initializer.js'
import directory from './libs/directory.js'
import { appendReadme } from './libs/append.js'
import Background from './libs/background.js'
import CharwordTable from './libs/charword_table.js';

async function main() {
  global.__dirname = path.dirname(fileURLToPath(import.meta.url))
  global.__config = getConfig()

  const op = process.argv[2]
  let OPERATOR_NAMES = process.argv.slice(3);

  const background = new Background()
  await background.process()
  const backgrounds = ['operator_bg.png', ...background.files]

  directory()

  /**
   * Skip all, no need for OPERATOR_NAME
   * build-all: build all assets
   * directory: build directory.json
   */
  switch (op) {
    case 'directory':
      process.exit(0)
    case 'build-all':
      for (const [key, _] of Object.entries(__config.operators)) {
        OPERATOR_NAMES.push(key)
      }
    case 'test':
      const charwordTable = new CharwordTable()
      await charwordTable.process()
      process.exit(0)
    default:
      break
  }

  assert(OPERATOR_NAMES.length !== 0, 'Please set the operator name.')

  for (const OPERATOR_NAME of OPERATOR_NAMES) {
    const OPERATOR_SOURCE_FOLDER = path.join(__dirname, __config.folder.operator)
    const OPERATOR_RELEASE_FOLDER = path.join(__dirname, __config.folder.release, OPERATOR_NAME)
    const SHOWCASE_PUBLIC_ASSSETS_FOLDER = path.join(OPERATOR_RELEASE_FOLDER, "assets")
    const EXTRACTED_FOLDER = path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, 'extracted')
    const OPERATOR_SHARE_FOLDER = path.join(OPERATOR_SOURCE_FOLDER, __config.folder.share)

    /**
     * Skip assets generation part
     * init: init folder and config for an operator
     * readme: append a new line to README.md
     */
    switch (op) {
      case 'init':
        init(OPERATOR_NAME, EXTRACTED_FOLDER)
        process.exit(0)
      case 'readme':
        appendReadme(OPERATOR_NAME)
        process.exit(0)
      default:
        break
    }

    rmdir(OPERATOR_RELEASE_FOLDER)

    const projectJson = new ProjectJson(OPERATOR_NAME, OPERATOR_SHARE_FOLDER, {
      backgrounds
    })
    projectJson.load().then((content) => {
      write(JSON.stringify(content, null, 2), path.join(OPERATOR_RELEASE_FOLDER, 'project.json'))
    })

    const assetsProcessor = new AssetsProcessor(OPERATOR_NAME)
    assetsProcessor.process(EXTRACTED_FOLDER).then((content) => {
      write(JSON.stringify(content.assetsJson, null), path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, `${__config.operators[OPERATOR_NAME].filename}.json`))
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
        source: path.join(OPERATOR_SHARE_FOLDER, __config.folder.background),
        target: path.join(SHOWCASE_PUBLIC_ASSSETS_FOLDER, __config.folder.background)
      },
      {
        filename: `${__config.operators[OPERATOR_NAME].logo}.png`,
        source: path.join(OPERATOR_SHARE_FOLDER, 'logo'),
        target: path.join(SHOWCASE_PUBLIC_ASSSETS_FOLDER)
      },
      {
        filename: `${__config.operators[OPERATOR_NAME].fallback_name}.png`,
        source: path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME),
        target: path.join(SHOWCASE_PUBLIC_ASSSETS_FOLDER)
      },
    ]
    filesToCopy.forEach((file) => {
      copy(path.join(file.source, file.filename), path.join(file.target, file.filename))
    })

    const envPath = path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, '.env')
    writeSync((new EnvGenerator(OPERATOR_NAME, {
      backgrounds
    })).generate(), envPath)
    fork(path.join(__dirname, 'vite.js'), [op, OPERATOR_NAME])
  }
}

main();