import path from 'path'
import { mkdir, copy } from './file.js'
import { appendMainConfig } from './append.js'

export default function init(operatorName, __dirname, extractedDir) {
    mkdir(extractedDir)
    copy(path.join(__dirname, 'config', '_template.yaml'), path.join(__dirname, 'config', `${operatorName}.yaml`))
    appendMainConfig(operatorName, __dirname)
}