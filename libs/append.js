import path from 'path'
import { appendSync, readSync } from './file.js'

export function appendReadme(config, operatorName, rootDir) {
    const operatorConfig = config.operators[operatorName]
    const projectJson = JSON.parse(readSync(path.join(rootDir, config.folder.operator, operatorName, 'project.json')))
    appendSync(
        `\n| ${operatorConfig.title.split(' - ')[0].split('Arknights: ')[1]} | [Link](https://arknights.halyul.dev/${operatorConfig.link}/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=${projectJson.workshopid}) |`,
        path.join(rootDir, 'README.md')
    )
}

export function appendMainConfig(operatorName, rootDir) {
    appendSync(
        `\n  ${operatorName}: !include config/${operatorName}.yaml`,
        path.join(rootDir, 'config.yaml')
    )
}