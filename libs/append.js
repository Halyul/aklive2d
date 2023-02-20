import path from 'path'
import { appendSync, readSync } from './file.js'

export function appendReadme(operatorName) {
    const operatorConfig = __config.operators[operatorName]
    const projectJson = JSON.parse(readSync(path.join(__projetRoot, __config.folder.operator, operatorName, 'project.json')))
    appendSync(
        `\n| ${operatorConfig.title.split(' - ')[0].split('Arknights: ')[1]} | [Link](https://arknights.halyul.dev/${operatorConfig.link}/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=${projectJson.workshopid}) |`,
        path.join(__projetRoot, 'README.md')
    )
}

export function appendMainConfig(operatorName) {
    appendSync(
        `\n  ${operatorName}: !include config/${operatorName}.yaml`,
        path.join(__projetRoot, 'config.yaml')
    )
}