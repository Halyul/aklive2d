import path from 'path'
import { writeSync, copy, rmdir } from './file.js'
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
          cur.voiceLangs = []
          const voiceInfo = Object.values(charwordTable.lookup(cur.link).operator.info.zh_CN)
          voiceInfo.forEach((item) => {
            cur.voiceLangs = [...cur.voiceLangs, ...Object.keys(item)]
          })
          return acc
        }, {}))
      .sort((a, b) => Date.parse(b[0].date) - Date.parse(a[0].date)),
  }
  const versionJson = __config.version

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
