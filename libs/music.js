/* eslint-disable no-undef */
import path from 'path';
import { read } from './yaml.js';
import Downloader from "./downloader.js"

export default class Music {
  #downloader = new Downloader()
  #sharedPath = path.join(__projectRoot, __config.folder.operator, __config.folder.share)

  async process() {
    await this.#download()
  }

  async #download() {
    const metaTable = await this.#downloader.github(`https://api.github.com/repos/Kengxxiao/ArknightsGameData/commits?path=zh_CN/gamedata/excel/display_meta_table.json`, `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/display_meta_table.json`, path.join(this.#sharedPath, `display_meta_table.json`))
    const audioDataTable = await this.#downloader.github(`https://api.github.com/repos/Kengxxiao/ArknightsGameData/commits?path=zh_CN/gamedata/excel/audio_data.json`, `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/audio_data.json`, path.join(this.#sharedPath, `audio_data.json`))
  }

  copy() {
    const musicFolder = path.join(__projectRoot, __config.folder.operator, __config.folder.share, __config.folder.music);
    const musicMapping = read(path.join(musicFolder, 'mapping.yaml'));
    const musicToCopy = Object.values(musicMapping).map(entry => Object.values(entry)).flat(1).filter(entry => entry !== null).map(entry => {
      return {
        filename: entry,
        source: musicFolder,
      }
    })

    return {
      musicToCopy,
      musicMapping,
    }
  }
}
