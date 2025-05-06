import path from 'node:path'
import { githubDownload } from '@aklive2d/downloader'
import config from '@aklive2d/config'
import { AUTO_UPDATE_FOLDER } from '../index.ts'

export const update = async () => {
    const character_table_json = path.resolve(
        AUTO_UPDATE_FOLDER,
        config.module.operator.character_table_json
    )
    const skin_table_json = path.resolve(
        AUTO_UPDATE_FOLDER,
        config.module.operator.skin_table_json
    )
    await githubDownload(
        `https://api.github.com/repos/Kengxxiao/ArknightsGameData/commits?path=zh_CN/gamedata/excel/character_table.json`,
        `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/character_table.json`,
        character_table_json
    )
    await githubDownload(
        `https://api.github.com/repos/Kengxxiao/ArknightsGameData/commits?path=zh_CN/gamedata/excel/skin_table.json`,
        `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/skin_table.json`,
        skin_table_json
    )
}
