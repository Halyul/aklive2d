import path from 'path'
import { writeSync, copy, rmdir } from './file.js'

/**
 * TODO: 
 * 1. add voice config -> look up charword table
 */

export default function () {
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
          return acc
        }, {}))
      .sort((a, b) => Date.parse(b[0].date) - Date.parse(a[0].date)),
  }
  writeSync(JSON.stringify(directoryJson, null), path.join(targetFolder, "directory.json"))
  filesToCopy.forEach((key) => {
    copy(path.join(sourceFolder, key, 'assets.json'), path.join(targetFolder, `${__config.operators[key].filename}.json`))
    if (__config.operators[key].portrait) {
      copy(path.join(sourceFolder, key, 'assets_portrait.json'), path.join(targetFolder, `${__config.operators[key].portrait}.json`))
    }
  })
}
