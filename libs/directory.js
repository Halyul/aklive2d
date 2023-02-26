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
  const filesToCopy = [];
  const directoryJson = []
  for (const [key, value] of Object.entries(__config.operators)) {
    filesToCopy.push(key);
    directoryJson.push(value);
  }
  writeSync(JSON.stringify(directoryJson, null), path.join(targetFolder, "directory.json"))
  filesToCopy.forEach((key) => {
    copy(path.join(sourceFolder, key, 'assets.json'), path.join(targetFolder, `${__config.operators[key].filename}.json`))
    if (__config.operators[key].portrait) {
      copy(path.join(sourceFolder, key, 'assets_portrait.json'), path.join(targetFolder, `${__config.operators[key].portrait}.json`))
    }
  })
}
