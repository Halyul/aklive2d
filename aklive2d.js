/* eslint-disable no-fallthrough */
/* eslint-disable no-undef */
import assert from 'assert'
import path from 'path'
import { fileURLToPath } from 'url'
import { fork } from 'child_process';
import getConfig from './libs/config.js'
import ProjectJson from './libs/project_json.js'
import EnvGenerator from './libs/env_generator.js'
import { write, rmdir, copy, writeSync, copyDir } from './libs/file.js'
import AssetsProcessor from './libs/assets_processor.js'
import init from './libs/initializer.js'
import directory from './libs/directory.js'
import { appendReadme } from './libs/append.js'
import { increase } from './libs/version.js';
import Background from './libs/background.js'
import CharwordTable from './libs/charword_table.js';
import Music from './libs/music.js';

async function main() {
  global.__projectRoot = path.dirname(fileURLToPath(import.meta.url))
  global.__config = getConfig()

  const op = process.argv[2]
  let OPERATOR_NAMES = process.argv.slice(3);

  const charwordTable = new CharwordTable()
  const musicTable = new Music()

  /**
   * Skip all, no need for OPERATOR_NAME
   * build-all: build all assets
   * directory: build directory
   */
  switch (op) {
    case 'directory':
      assert(OPERATOR_NAMES.length !== 0, 'Please set a mode for Directory.')
      fork(path.join(__projectRoot, 'vite.config.js'), [op, OPERATOR_NAMES])
      return
    case 'build-all':
      __config.version.showcase = increase(__projectRoot)
    case 'charwords:build':
      for (const [key,] of Object.entries(__config.operators)) {
        OPERATOR_NAMES.push(key)
      }
      break
    case 'preview':
      assert(OPERATOR_NAMES.length !== 0, 'Please set the operator name.')
      fork(path.join(__projectRoot, 'vite.config.js'), [op, OPERATOR_NAMES])
      return
    case 'charwords:update':
      await charwordTable.process()
      process.exit(0)
    case 'music':
      await musicTable.process()
      process.exit(0)
    default:
      break
  }

  assert(OPERATOR_NAMES.length !== 0, 'Please set the operator name.')

  const background = new Background()
  await background.process()
  const backgrounds = ['operator_bg.png', ...background.files]
  const { musicToCopy, musicMapping } = musicTable.copy()

  for (const OPERATOR_NAME of OPERATOR_NAMES) {
    const OPERATOR_SOURCE_FOLDER = path.join(__projectRoot, __config.folder.operator)
    const OPERATOR_RELEASE_FOLDER = path.join(__projectRoot, __config.folder.release, OPERATOR_NAME)
    const SHOWCASE_PUBLIC_ASSSETS_FOLDER = path.join(OPERATOR_RELEASE_FOLDER, "assets")
    const EXTRACTED_FOLDER = path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, 'extracted')
    const VOICE_FOLDERS = __config.folder.voice.sub.map((sub) => path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, __config.folder.voice.main, sub.name))
    const OPERATOR_SHARE_FOLDER = path.join(OPERATOR_SOURCE_FOLDER, __config.folder.share)

    /**
     * Skip assets generation part
     * init: init folder and config for an operator
     * readme: append a new line to README.md
     */
    switch (op) {
      case 'init':
        init(OPERATOR_NAME, [EXTRACTED_FOLDER, ...VOICE_FOLDERS])
        process.exit(0)
      case 'readme':
        appendReadme(OPERATOR_NAME)
        process.exit(0)
      default:
        break
    }

    rmdir(OPERATOR_RELEASE_FOLDER)

    const charwordTableLookup = charwordTable.lookup(OPERATOR_NAME)
    const voiceJson = {}
    voiceJson.config = {
      default_region: charwordTableLookup.config.default_region.replace("_", "-"),
      regions: charwordTableLookup.config.regions.map((item) => item.replace("_", "-")),
    }
    voiceJson.voiceLangs = {}
    voiceJson.subtitleLangs = {}
    const subtitleInfo = Object.keys(charwordTableLookup.operator.info)
    subtitleInfo.forEach((item) => {
      if (Object.keys(charwordTableLookup.operator.info[item]).length > 0) {
        const key = item.replace("_", "-")
        voiceJson.subtitleLangs[key] = {}
        for (const [id, subtitles] of Object.entries(charwordTableLookup.operator.voice[item])) {
          const match = id.replace(/(.+?)([A-Z]\w+)/, '$2')
          if (match === id) {
            voiceJson.subtitleLangs[key].default = subtitles
          } else {
            voiceJson.subtitleLangs[key][match] = subtitles
          }
        }
        voiceJson.voiceLangs[key] = {}
        Object.values(charwordTableLookup.operator.info[item]).forEach((item) => {
          voiceJson.voiceLangs[key] = { ...voiceJson.voiceLangs[key], ...item }
        })
      }
    })

    let voiceLangs = [], subtitleLangs = [];
    try {
      voiceLangs = Object.keys(voiceJson.voiceLangs["zh-CN"])
      subtitleLangs = Object.keys(voiceJson.subtitleLangs)

      writeSync(JSON.stringify(voiceJson), path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, 'charword_table.json'))
    } catch (e) {
      console.log(`charword_table is not available`)
    }

    switch (op) {
      case 'charwords:build':
        continue
      default:
        break
    }

    const envPath = path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, '.env')
    writeSync((new EnvGenerator()).generate([
      {
        key: "link",
        value: __config.operators[OPERATOR_NAME].link
      }, {
        key: "title",
        value: __config.operators[OPERATOR_NAME].title
      }, {
        key: "filename",
        value: __config.operators[OPERATOR_NAME].filename.replace('#', '%23')
      }, {
        key: "logo_filename",
        value: __config.operators[OPERATOR_NAME].logo
      }, {
        key: "fallback_filename",
        value: __config.operators[OPERATOR_NAME].fallback_name.replace('#', '%23')
      }, {
        key: "viewport_left",
        value: __config.operators[OPERATOR_NAME].viewport_left
      }, {
        key: "viewport_right",
        value: __config.operators[OPERATOR_NAME].viewport_right
      }, {
        key: "viewport_top",
        value: __config.operators[OPERATOR_NAME].viewport_top
      }, {
        key: "viewport_bottom",
        value: __config.operators[OPERATOR_NAME].viewport_bottom
      }, {
        key: "invert_filter",
        value: __config.operators[OPERATOR_NAME].invert_filter
      }, {
        key: "image_width",
        value: 2048
      }, {
        key: "image_height",
        value: 2048
      }, {
        key: "background_files",
        value: JSON.stringify(backgrounds)
      }, {
        key: "background_folder",
        value: __config.folder.background
      }, {
        key: "voice_folders",
        value: JSON.stringify(__config.folder.voice)
      }, {
        key: "music_folder",
        value: __config.folder.music
      }, {
        key: "music_mapping",
        value: JSON.stringify(musicMapping)
      }
    ]), envPath)

    const projectJson = new ProjectJson(OPERATOR_NAME, OPERATOR_SHARE_FOLDER, {
      backgrounds,
      voiceLangs,
      subtitleLangs,
      music: Object.keys(musicMapping)
    })
    projectJson.load().then((content) => {
      write(JSON.stringify(content, null, 2), path.join(OPERATOR_RELEASE_FOLDER, 'project.json'))
    })

    const assetsProcessor = new AssetsProcessor(OPERATOR_NAME, OPERATOR_SHARE_FOLDER)
    assetsProcessor.process(EXTRACTED_FOLDER).then((content) => {
      write(JSON.stringify(content.assetsJson, null), path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, `assets.json`))
    })

    const filesToCopy = [
      ...background.getFilesToCopy(SHOWCASE_PUBLIC_ASSSETS_FOLDER),
      ...musicToCopy.map(entry => {
        return {
          ...entry,
          target: path.join(SHOWCASE_PUBLIC_ASSSETS_FOLDER, __config.folder.music)
        }
      }),
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
      {
        filename: `${__config.operators[OPERATOR_NAME].fallback_name}_portrait.png`,
        source: path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME),
        target: path.join(SHOWCASE_PUBLIC_ASSSETS_FOLDER)
      }
    ]
    filesToCopy.forEach((file) => {
      copy(path.join(file.source, file.filename), path.join(file.target, file.filename))
    })

    const foldersToCopy = [
      {
        source: path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, __config.folder.voice.main),
        target: path.join(SHOWCASE_PUBLIC_ASSSETS_FOLDER, __config.folder.voice.main)
      }
    ]
    foldersToCopy.forEach((folder) => {
      copyDir(folder.source, folder.target)
    })

    fork(path.join(__projectRoot, 'vite.config.js'), [op, OPERATOR_NAME])
  }

  directory({ backgrounds, musicMapping })
}

main();