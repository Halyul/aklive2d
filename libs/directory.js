/* eslint-disable no-undef */
import path from 'path'
import { writeSync, copy, readSync as readFile } from './file.js'
import AssetsProcessor from './assets_processor.js'
import EnvGenerator from './env_generator.js'

export default function (dataDir, { backgrounds, musicMapping }) {
  const extractedFolder = path.join(dataDir, '_directory')
  const targetFolder = path.join(__projectRoot, __config.folder.release, __config.folder.directory);
  const directoryAssetFolder = path.join(__projectRoot, __config.folder.directory_src, 'src');
  const sourceFolder = path.join(__projectRoot, __config.folder.operator);
  const filesToCopy = Object.keys(__config.operators)
  const directoryJson = {
    operators: Object.values(
      Object.values(__config.operators)
        .reduce((acc, cur) => {
          const date = cur.date
          if (acc[date]) {
            acc[date].push(cur)
          } else {
            acc[date] = [cur]
          }

          cur.workshopId = null
          try {
            cur.workshopId = JSON.parse(readFile(path.join(dataDir, cur.link, 'project.json'))).workshopid
          } catch (e) {
            console.log(`No workshop id for ${cur.link}!`)
          }

          return acc
        }, {}))
      .sort((a, b) => Date.parse(b[0].date) - Date.parse(a[0].date)),
  }

  __config.directory.error.files.forEach((key) => {
    const assetsProcessor = new AssetsProcessor()
    assetsProcessor.generateAssets(key.key, extractedFolder).then((content) => {
      writeSync(JSON.stringify(content.assetsJson, null), path.join(targetFolder, `${key.key}.json`))
    })
  })

  writeSync((new EnvGenerator()).generate([
    {
      key: "insight_id",
      value: __config.insight_id
    },
    {
      key: "app_title",
      value: __config.directory.title
    }, {
      key: "app_voice_url",
      value: __config.directory.voice
    }, {
      key: "voice_folders",
      value: JSON.stringify(__config.folder.voice)
    }, {
      key: "directory_folder",
      value: JSON.stringify(__config.folder.directory)
    }
    , {
      key: "background_folder",
      value: JSON.stringify(__config.folder.background)
    }, {
      key: "available_operators",
      value: JSON.stringify(Object.keys(__config.operators))
    }, {
      key: "error_files",
      value: JSON.stringify(__config.directory.error).replace('#', '%23')
    }, {
      key: "music_folder",
      value: __config.folder.music
    }, {
      key: "music_mapping",
      value: JSON.stringify(musicMapping)
    }
  ]), path.join(__projectRoot, __config.folder.directory_src, '.env'))

  writeSync(JSON.stringify(directoryJson, null), path.join(directoryAssetFolder, "_directory.json"))
  writeSync(JSON.stringify(backgrounds, null), path.join(directoryAssetFolder, "_backgrounds.json"))
  filesToCopy.forEach((key) => {
    copy(path.join(sourceFolder, key, 'assets.json'), path.join(targetFolder, `${__config.operators[key].filename}.json`))
    copy(path.join(sourceFolder, key, 'charword_table.json'), path.join(targetFolder, `voice_${key}.json`))
  })
  copy(path.join(extractedFolder, __config.directory.error.voice), path.join(targetFolder, `error.ogg`))
}
