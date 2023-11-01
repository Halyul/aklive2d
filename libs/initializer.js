/* eslint-disable no-undef */
import path from 'path'
import { stringify } from 'yaml'
import { read as readYAML } from './yaml.js'
import { mkdir, writeSync } from './file.js'
import { appendMainConfig } from './append.js'

export default function init(operatorName, extractedDir, officalInfo) {
    const officalId = process.argv[4]
    const template = readYAML(path.join(__projectRoot, 'config', '_template.yaml'))
    extractedDir.forEach((dir) => {
        mkdir(dir)
    })
    const currentOpertor = officalInfo.find(officalId);
    if (currentOpertor === undefined) {
        throw new Error('Invalid operator id')
    }
    template.offical_id = currentOpertor.id
    template.codename = currentOpertor.codename
    
    writeSync(stringify(template), path.join(__projectRoot, 'config', `${operatorName}.yaml`))
    appendMainConfig(operatorName)
}