import path from 'path'
import { stringify } from 'yaml'
import { read as readYAML } from './yaml.js'
import { mkdir, writeSync } from './file.js'
import { appendMainConfig } from './append.js'

export default function init(extractedDir) {
    mkdir(extractedDir)
    const date = new Date()
    const template = readYAML(path.join(__dirname, 'config', '_template.yaml'))
    template.link = __operator_name
    template.date = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0') }`
    writeSync(stringify(template), path.join(__dirname, 'config', `${__operator_name}.yaml`))
    appendMainConfig(__operator_name, __dirname)
}