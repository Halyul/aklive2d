import path from 'node:path'
import config from '@aklive2d/config'
import { file, yaml } from '@aklive2d/libs'
import { mapping as officialInfoMapping } from '@aklive2d/official-info'
import { stringify } from 'yaml'
import { CONFIG_FOLDER, CONFIG_PATH, skinTable } from '../index.ts'
import {
    findCodename,
    findSkinEntry,
    getExtractedFolder,
    getVoiceFolders,
} from './utils.ts'

export const init = (name: string, id: string) => {
    const voiceFolders = getVoiceFolders(name)
    const extractedFolder = getExtractedFolder(name)
    const operatorConfigFolder = CONFIG_FOLDER
    const foldersToCreate = [extractedFolder, ...voiceFolders]

    const template = yaml.read(
        path.resolve(operatorConfigFolder, config.module.operator.template_yaml)
    )
    foldersToCreate.forEach((dir) => {
        file.mkdir(dir)
    })
    const currentOpertor = officialInfoMapping[id]
    if (currentOpertor === undefined) {
        throw new Error('Invalid operator id')
    }
    template.official_id = currentOpertor.id
    try {
        const entryName =
            currentOpertor.type === 'skin'
                ? currentOpertor.skinName['zh-CN']
                : currentOpertor.skinName['en-US']
        const skinEntry = findSkinEntry(
            skinTable,
            entryName,
            currentOpertor.type
        )
        template.codename = findCodename(skinEntry, currentOpertor)
    } catch (e: unknown) {
        console.log(e as string)
        template.codename =
            currentOpertor.type === 'skin'
                ? {
                      'zh-CN': `${currentOpertor.skinName['zh-CN']} · ${currentOpertor.operatorName}`,
                      'en-US': `${currentOpertor.skinName['en-US']} / ${currentOpertor.operatorName}`,
                  }
                : {
                      'zh-CN': `${currentOpertor.operatorName}`,
                      'en-US': `${currentOpertor.skinName['en-US']}`,
                  }
    }

    file.writeSync(
        stringify(template),
        path.resolve(operatorConfigFolder, `${name}.yaml`)
    )
    file.appendSync(
        `${name}: !include ${config.module.operator.config}/${name}.yaml\n`,
        CONFIG_PATH
    )
}
