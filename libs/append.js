import path from 'path'
import { appendSync, readSync } from './file.js'

export function appendReadme() {
    const operatorConfig = __config.operators[__operator_name]
    const projectJson = JSON.parse(readSync(path.join(__dirname, __config.folder.operator, __operator_name, 'project.json')))
    appendSync(
        `\n| ${operatorConfig.title.split(' - ')[0].split('Arknights: ')[1]} | [Link](https://arknights.halyul.dev/${operatorConfig.link}/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=${projectJson.workshopid}) |`,
        path.join(__dirname, 'README.md')
    )
}

export function appendMainConfig() {
    appendSync(
        `\n  ${__operator_name}: !include config/${__operator_name}.yaml`,
        path.join(__dirname, 'config.yaml')
    )
}