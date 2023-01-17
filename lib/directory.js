import path from 'path'
import { writeSync, copy, rmdir } from './file.js'

export default function (config, rootDir) {
  const targetFolder = path.join(rootDir, config.folder.release, config.folder.directory);
  const sourceFolder = path.join(rootDir, config.folder.operator);
  rmdir(targetFolder);
  const filesToCopy = [];
  const directoryJson = []
  for (const [key, value] of Object.entries(config.operators)) {
    filesToCopy.push(key);
    directoryJson.push(value);
  }
  writeSync(JSON.stringify(directoryJson, null), path.join(targetFolder, "directory.json"))
  filesToCopy.forEach((key) => {
    const filename = `${config.operators[key].filename}.json`;
    copy(path.join(sourceFolder, key, filename), path.join(targetFolder, filename))
  })
}
