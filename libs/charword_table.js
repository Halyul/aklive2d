/* eslint-disable no-undef */
import path from "path"
import dotenv from "dotenv"
import { writeSync, readSync } from "./file.js"
import Downloader from "./downloader.js"

dotenv.config()

// zh_TW uses an older version of charword_table.json
// zh_TW is removed
const REGIONS = ["zh_CN", "en_US", "ja_JP", "ko_KR"]
const REGION_URLS = {
  "zh_CN": "Kengxxiao/ArknightsGameData",
  "en_US": "Kengxxiao/ArknightsGameData_YoStar",
  "ja_JP": "Kengxxiao/ArknightsGameData_YoStar",
  "ko_KR": "Kengxxiao/ArknightsGameData_YoStar",
}
const DEFAULT_REGION = REGIONS[0]
const NICKNAME = {
  "zh_CN": "博士",
  "en_US": "Doctor",
  "ja_JP": "ドクター",
  "ko_KR": "박사",
  "zh_TW": "博士",
}

export function getOperatorId(operatorConfig) {
  return operatorConfig.filename.replace(/^(dyn_illust_)(char_[\d]+)(_[\w]+)(|(_.+))$/g, '$2$3$4')
}

export default class CharwordTable {
  #operatorIDs = Object.values(__config.operators).map(operator => { return getOperatorId(operator) })
  #charwordTablePath = path.join(__projectRoot, __config.folder.auto_update_data)
  #charwordTableFile = path.join(this.#charwordTablePath, 'charword_table.json')
  #charwordTable = JSON.parse(readSync(this.#charwordTableFile)) || {
    config: {
      default_region: DEFAULT_REGION,
      regions: REGIONS,
    },
    operators: {},
  }

  async process() {
    const regionObject = REGIONS.reduce((acc, cur) => ({ ...acc, [cur]: {} }), {})
    this.#operatorIDs.forEach(id => {
      this.#charwordTable.operators[id] = {
        alternativeId: id.replace(/^(char_)([\d]+)(_[\w]+)(|(_.+))$/g, '$1$2$3'),
        voice: JSON.parse(JSON.stringify(regionObject)), // deep copy
        info: JSON.parse(JSON.stringify(regionObject)), // deep copy
      }
    })
    await this.#load(DEFAULT_REGION)
    await Promise.all(REGIONS.slice(1).map(async (region) => {await this.#load(region)}))
    writeSync(JSON.stringify(this.#charwordTable), this.#charwordTableFile)
  }

  lookup(operatorName) {
    const operatorId = getOperatorId(__config.operators[operatorName])
    const operatorBlock = this.#charwordTable.operators[operatorId]
    return {
      config: this.#charwordTable.config,
      operator: operatorBlock.ref ? this.#charwordTable.operators[operatorBlock.alternativeId] : operatorBlock,
    }
  }

  async #load(region) {

    const data = await this.#download(region)

    // put voice actor info into charword_table
    for (const [id, element] of Object.entries(this.#charwordTable.operators)) {
      let operatorId = id
      let useAlternativeId = false
      if (typeof data.voiceLangDict[operatorId] === 'undefined') {
        operatorId = element.alternativeId
        useAlternativeId = true
      }
      if (region === DEFAULT_REGION) {
        element.infile = this.#operatorIDs.includes(operatorId);
        element.ref = useAlternativeId && element.infile;
      }
      // not available in other region
      if (typeof data.voiceLangDict[operatorId] === 'undefined') {
        console.log(`Voice actor info of ${id} is not available in ${region}.`)
        continue
      }

      if (element.infile && useAlternativeId) {
        // if using alternative id and infile is true, means data can be 
        // refered inside the file
        // if infile is false, useAlternativeId is always true
        // if useAlternativeId is false, infile is always true
        // | case                | infile | useAlternativeId | Note            |
        // | ------------------- | ------ | ---------------- | --------------- |
        // | lee_trust_your_eyes | false  | true             | skin only       |
        // | nearl_relight       | true   | true    | skin, operator, no voice |
        // | nearl               | true   | false            | operator only   |
        // | w_fugue             | true   | false      | skin, operator, voice |
        continue
      }
      Object.values(data.voiceLangDict[operatorId].dict).forEach(item => {
        if (typeof element.info[region][item.wordkey] === 'undefined') {
          element.info[region][item.wordkey] = {}
        }
        element.info[region][item.wordkey][item.voiceLangType] = [...(typeof item.cvName === 'string' ? [item.cvName] : item.cvName)]
      })
    }

    // put voice lines into charword_table
    Object.values(data.charWords).forEach(item => {
      const operatorInfo = Object.values(this.#charwordTable.operators).filter(element => element.info[region][item.wordKey])
      if (operatorInfo.length > 0) {
        for (const operator of operatorInfo) {
          if (typeof operator.voice[region][item.wordKey] === 'undefined') {
            operator.voice[region][item.wordKey] = {}
          }
          operator.voice[region][item.wordKey][item.voiceId] = {
            title: item.voiceTitle,
            text: item.voiceText.replace(/{@nickname}/g, NICKNAME[region]),
          }
        }
      }
    })
  }

  async #download(region) {
    return await (new Downloader()).github(
      `https://api.github.com/repos/${REGION_URLS[region]}/commits?path=${region}/gamedata/excel/charword_table.json`,
      `https://raw.githubusercontent.com/${REGION_URLS[region]}/master/${region}/gamedata/excel/charword_table.json`,
      path.join(this.#charwordTablePath, `charword_table_${region}.json`)
    )
  }

}
