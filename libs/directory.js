import path from 'path'
import { writeSync, copy, rmdir, readSync as readFile } from './file.js'
import { read } from './yaml.js';

/**
 * TODO: 
 * 1. add voice config -> look up charword table
 */

export default function ({ backgrounds, charwordTable }) {
  const targetFolder = path.join(__projetRoot, __config.folder.release, __config.folder.directory);
  const sourceFolder = path.join(__projetRoot, __config.folder.operator);
  rmdir(targetFolder);
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
            cur.workshopId = JSON.parse(readFile(path.join(__projetRoot, __config.folder.operator, cur.link, 'project.json'))).workshopid
          } catch (e) {
            console.log(`No workshop id for ${cur.link}!`, e)
          }

          return acc
        }, {}))
      .sort((a, b) => Date.parse(b[0].date) - Date.parse(a[0].date)),
  }
  const versionJson = __config.version

  filesToCopy.forEach((operator) => {
    const voiceJson = {}

    voiceJson.voiceLangs = {}
    voiceJson.subtitleLangs = {}
    const charwordTableObj = charwordTable.lookup(operator)
    const subtitleInfo = Object.keys(charwordTableObj.operator.info)
    subtitleInfo.forEach((item) => {
      if (Object.keys(charwordTableObj.operator.info[item]).length > 0) {
        const key = item.replace("_", "-")
        voiceJson.subtitleLangs[key] = {}
        for (const [id, subtitles] of Object.entries(charwordTableObj.operator.voice[item])) {
          const match = id.replace(/(.+?)([A-Z]\w+)/, '$2')
          if (match === id) {
            voiceJson.subtitleLangs[key].default = subtitles
          } else {
            voiceJson.subtitleLangs[key][match] = subtitles
          }
        }
        voiceJson.voiceLangs[key] = {}
        Object.values(charwordTableObj.operator.info[item]).forEach((item) => {
          voiceJson.voiceLangs[key] = { ...voiceJson.voiceLangs[key], ...item }
        })
      }
    })

    writeSync(JSON.stringify(voiceJson, null), path.join(targetFolder, `voice_${operator}.json`))
  })

  const changelogs = read(path.join(__projetRoot, 'changelogs.yaml'))
  const changelogsArray = Object.keys(changelogs).reduce((acc, cur) => {
    const array = []
    Object.keys(changelogs[cur]).map((item) => {
      array.push({
        key: cur,
        date: item,
        content: [...changelogs[cur][item]]
      })
    })
    acc.push(array)
    return acc
  }, [])

  writeSync(JSON.stringify(directoryJson, null), path.join(targetFolder, "directory.json"))
  writeSync(JSON.stringify(versionJson, null), path.join(targetFolder, "version.json"))
  writeSync(JSON.stringify(changelogsArray, null), path.join(targetFolder, "changelogs.json"))
  writeSync(JSON.stringify(backgrounds, null), path.join(targetFolder, "backgrounds.json"))
  filesToCopy.forEach((key) => {
    copy(path.join(sourceFolder, key, 'assets.json'), path.join(targetFolder, `${__config.operators[key].filename}.json`))
  })
}
