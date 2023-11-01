/* eslint-disable no-undef */
import path from 'path';
import { writeSync, readSync } from "./file.js"
import Downloader from "./downloader.js"

export default class LogoInfo {
    #downloader = new Downloader()
    #sharedPath = path.join(__projectRoot, __config.folder.operator, __config.folder.share)

    async process() {
        const logoTable = await this.#download()
        const nameFileMapping = {}
        Object.keys(logoTable.forceToGroupDict).forEach(key => {
            nameFileMapping[logoTable.forceToGroupDict[key]] = `${key}.png`;
        });
        // writeSync(JSON.stringify(list, null), path.join(this.#sharedPath, `logo_table.json`))
    }

    async #download() {
        const logoTable = await this.#downloader.github(`https://api.github.com/repos/Kengxxiao/ArknightsGameData/commits?path=zh_CN/gamedata/art/handbookpos_table.json`, `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/art/handbookpos_table.json`, path.join(this.#sharedPath, `handbookpos_table.json`))
        return logoTable
    }

    lookup() {
        const logoTable = JSON.parse(readSync(path.join(this.#sharedPath, `logo_table.json`)))

        
    }
}
