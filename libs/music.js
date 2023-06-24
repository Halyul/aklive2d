/* eslint-disable no-undef */
import path from 'path';
import { writeSync, readSync } from "./file.js"
import Downloader from "./downloader.js"

export default class Music {
  #downloader = new Downloader()
  #sharedPath = path.join(__projectRoot, __config.folder.operator, __config.folder.share)

  async process() {
    const { metaTable, audioDataTable } = await this.#download()
    const musicTable = audioDataTable.musics
    const musicBank = audioDataTable.bgmBanks
    const musicBankAlias = audioDataTable.bankAlias
    const musicData = metaTable.homeBackgroundData.homeBgDataList.reduce((acc, cur) => {
      acc.push({
        id: cur.bgId,
        musicId: cur.bgMusicId
      })
      return acc
    }, [])
    const list = []
    for (const item of musicData) {
      let bankName = musicTable.find((el) => item.musicId === el.id).bank
      if (typeof musicBankAlias[bankName] !== 'undefined') {
        bankName = musicBankAlias[bankName]
      }
      const obj = musicBank.find((el) => bankName === el.name)
      list.push({
        id: item.id,
        intro: obj.intro,
        loop: obj.loop,
      })
    }
    list.push({
      id: "operator_bg",
      intro: "m_sys_void_intro",
      loop: "m_sys_void_loop",
    })
    writeSync(JSON.stringify(list, null, 2), path.join(this.#sharedPath, `music_table.json`))
  }

  async #download() {
    const metaTable = await this.#downloader.github(`https://api.github.com/repos/Kengxxiao/ArknightsGameData/commits?path=zh_CN/gamedata/excel/display_meta_table.json`, `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/display_meta_table.json`, path.join(this.#sharedPath, `display_meta_table.json`))
    const audioDataTable = await this.#downloader.github(`https://api.github.com/repos/Kengxxiao/ArknightsGameData/commits?path=zh_CN/gamedata/excel/audio_data.json`, `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/audio_data.json`, path.join(this.#sharedPath, `audio_data.json`))
    return {
      metaTable,
      audioDataTable,
    }
  }

  copy() {
    const musicFolder = path.join(__projectRoot, __config.folder.operator, __config.folder.share, __config.folder.music);
    const musicTable = JSON.parse(readSync(path.join(this.#sharedPath, `music_table.json`)))
    const musicMapping = {}
    const musicToCopy = []

    for (const item of musicTable) {
      const key = `${item.id}.png`
      musicMapping[key] = {}

      if (item.intro) {
        const filename = `${item.intro.split('/').pop()}.ogg`
        musicMapping[key].intro = filename
        musicToCopy.push({
          filename,
          source: musicFolder,
        })
      } else {
        musicMapping[key].intro = null
      }

      if (item.loop) {
        const filename = `${item.loop.split('/').pop()}.ogg`
        musicMapping[key].loop = filename
        musicToCopy.push({
          filename,
          source: musicFolder,
        })
      } else {
        musicMapping[key].loop = null
      }
    }

    return {
      musicToCopy,
      musicMapping,
    }
  }
}
