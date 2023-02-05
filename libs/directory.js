import path from 'path'
import { writeSync, copy, rmdir } from './file.js'

export default function () {
  const targetFolder = path.join(__dirname, __config.folder.release, __config.folder.directory);
  const sourceFolder = path.join(__dirname, __config.folder.operator);
  rmdir(targetFolder);
  const filesToCopy = [];
  const directoryJson = []
  for (const [key, value] of Object.entries(__config.operators)) {
    filesToCopy.push(key);
    directoryJson.push(value);
  }
  writeSync(JSON.stringify(directoryJson, null), path.join(targetFolder, "directory.json"))
  filesToCopy.forEach((key) => {
    const filename = `${__config.operators[key].filename}.json`;
    copy(path.join(sourceFolder, key, 'assets.json'), path.join(targetFolder, filename))
  })
}
