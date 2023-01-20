import path from 'path'
import { mkdir, copy } from './file.js'
import { appendMainConfig } from './append.js'

export default function init(extractedDir) {
    mkdir(extractedDir)
    copy(path.join(__dirname, 'config', '_template.yaml'), path.join(__dirname, 'config', `${__operator_name}.yaml`))
    appendMainConfig(__operator_name, __dirname)
}