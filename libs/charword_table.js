import fetch from "node-fetch"
import path from "path"
import { exists, writeSync, readdirSync, rm, readSync } from "./file.js"

// TODO: zh_TW uses an older version of charword_table.json
// const REGIONS = ["zh_CN", "en_US", "ja_JP", "ko_KR", "zh_TW"]
const REGIONS = ["zh_CN", "en_US", "ja_JP", "ko_KR"]
const DEFAULT_REGION = REGIONS[0]
const NICKNAME = {
  "zh_CN": "博士",
  "en_US": "Doctor",
  "ja_JP": "ドクター",
  "ko_KR": "박사",
  "zh_TW": "博士",
}

export default class CharwordTable {
  #operatorIDs = Object.values(__config.operators).map(operator => { return operator.filename.replace(/^(dyn_illust_)(char_[\d]+)(_[\w]+)(|(_.+))$/g, '$2$3$4') })
  #charwordTable = {
    config: {
      default_region: DEFAULT_REGION,
      regions: REGIONS,
    },
    operators: [],
  }
  #charwordTablePath = path.join(__dirname, __config.folder.operator, __config.folder.share)

  constructor() {
    // TODO: use object instead of array
    this.#charwordTable.operators = this.#operatorIDs.map(id => {
      return {
        mainId: id,
        alternativeId: id.replace(/^(char_)([\d]+)(_[\w]+)(|(_.+))$/g, '$1$2$3'),
        voice: REGIONS.reduce((acc, cur) => ({ ...acc, [cur]: [] }), {}), // use array to store voice lines
        info: REGIONS.reduce((acc, cur) => ({ ...acc, [cur]: {} }), {}), // use object to store voice actor info
      }
    })
  }

  async process() {
    for (const region of REGIONS) {
      await this.load(region)
    }
  }

  async load(region) {
    const data = await this.#download(region)

    // put voice actor info into charword_table
    this.#charwordTable.operators.forEach(element => {
      let operatorId = element.mainId
      if (typeof data.voiceLangDict[operatorId] === 'undefined') {
        operatorId = element.alternativeId
      }
      // not available in other region
      if (typeof data.voiceLangDict[operatorId] === 'undefined') {
        console.log(`Voice actor info of ${element.mainId} is not available in ${region}.`)
        return
      }
      Object.values(data.voiceLangDict[operatorId].dict).forEach(item => {
        if (typeof element.info[region][item.wordkey] === 'undefined') {
          element.info[region][item.wordkey] = []
        }
        element.info[region][item.wordkey].push({
          lang: item.voiceLangType,
          cvName: item.cvName,
        })
      })
    });

    // put voice lines into charword_table
    Object.values(data.charWords).forEach(item => {
      const operatorInfo = this.#charwordTable.operators.filter(element => element.info[region][item.wordKey])
      if (operatorInfo.length > 0) {
        operatorInfo[0].voice[region].push({
          ref: false,
          id: item.voiceId,
          title: item.voiceTitle,
          text: item.voiceText.replace(/{@nickname}/g, NICKNAME[region]),
          wordKey: item.wordKey,
        })
        if (operatorInfo.length > 1) {
          operatorInfo[1].voice[region].push({
            ref: true,
            id: item.voiceId,
            wordKey: item.wordKey,
          })
        }
      }
    })

    writeSync(JSON.stringify(this.#charwordTable), path.join(this.#charwordTablePath, 'charword_table.json'))
  }

  async #download(region) {
    const historyResponse = await fetch(`https://api.github.com/repos/Kengxxiao/ArknightsGameData/commits?path=${region}/gamedata/excel/charword_table.json`)
    const historyData = await historyResponse.json()
    const lastCommit = historyData[0]
    const lastCommitDate = new Date(lastCommit.commit.committer.date)
    const filepath = path.join(this.#charwordTablePath, `charword_table_${region}_${lastCommitDate.getTime()}.json`)
    console.log(`Last commit date: ${lastCommitDate.getTime()}`)

    if (exists(filepath)) {
      console.log(`charword_table_${region}.json is the latest version.`)
      return JSON.parse(readSync(filepath))
    }
    const response = await fetch(`https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/${region}/gamedata/excel/charword_table.json`)
    const data = await response.json()
    writeSync(JSON.stringify(data), filepath)
    console.log(`charword_table_${region}.json is updated.`)

    // remove old file
    const files = readdirSync(path.join(__dirname, __config.folder.operator, __config.folder.share))
    for (const file of files) {
      if (file.startsWith(`charword_table_${region}`) && file !== path.basename(filepath)) {
        rm(path.join(__dirname, __config.folder.operator, __config.folder.share, file))
      }
    }
    return data
  }
}
