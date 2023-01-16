import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

let __dirname
__dirname = __dirname || path.dirname(fileURLToPath(import.meta.url))

const directory = path.join(__dirname, 'operator');
fs.readdir(directory, function (err, files) {
  files.forEach(function (file) {
    if (file.startsWith('_')) return;
    console.log(execSync(`O=${file} node preprocessing.js && O=${file} pnpm run build`).toString());
  });
});