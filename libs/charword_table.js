/* eslint-disable no-undef */
import fetch from "node-fetch"
import path from "path"
import dotenv from "dotenv"
import { exists, writeSync, readdirSync, rm, readSync } from "./file.js"

dotenv.config()

// zh_TW uses an older version of charword_table.json
const REGIONS = ["zh_CN", "en_US", "ja_JP", "ko_KR", "zh_TW"]
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
  #charwordTablePath = path.join(__projetRoot, __config.folder.operator, __config.folder.share)
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
    if (region === 'zh_TW') {
      return await this.#zhTWLoad()
    }

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
        if (typeof operatorInfo[0].voice[region][item.wordKey] === 'undefined') {
          operatorInfo[0].voice[region][item.wordKey] = {}
        }
        operatorInfo[0].voice[region][item.wordKey][item.voiceId] = {
          title: item.voiceTitle,
          text: item.voiceText.replace(/{@nickname}/g, NICKNAME[region]),
        }
      }
    })
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
    const files = readdirSync(path.join(__projetRoot, __config.folder.operator, __config.folder.share))
    for (const file of files) {
      if (file.startsWith(`charword_table_${region}`) && file !== path.basename(filepath)) {
        rm(path.join(__projetRoot, __config.folder.operator, __config.folder.share, file))
      }
    }
    return data
  }

  async #zhTWLoad() {
    const region = 'zh_TW'
    const downloaded = await this.#zhTWDownload()
    const data = downloaded.data
    const handbook = downloaded.handbook

    // put voice actor info into charword_table
    for (const [id, element] of Object.entries(this.#charwordTable.operators)) {
      let operatorId = id
      let useAlternativeId = false
      if (typeof handbook.handbookDict[operatorId] === 'undefined') {
        operatorId = element.alternativeId
        useAlternativeId = true
      }
      // not available in other region
      if (typeof handbook.handbookDict[operatorId] === 'undefined') {
        console.log(`Voice actor info of ${id} is not available in ${region}.`)
        continue
      }
      if (element.infile && useAlternativeId) {
        continue
      }
      const charId = handbook.handbookDict[operatorId].charID
      if (typeof element.info[region][charId] === 'undefined') {
        element.info[region][charId] = {}
      }
      element.info[region][charId].JP = [...[handbook.handbookDict[operatorId].infoName]]
    }

    // put voice lines into charword_table
    Object.values(data).forEach(item => {
      const operatorInfo = Object.values(this.#charwordTable.operators).filter(element => element.info[region][item.wordKey])
      if (operatorInfo.length > 0) {
        if (typeof operatorInfo[0].voice[region][item.wordKey] === 'undefined') {
          operatorInfo[0].voice[region][item.wordKey] = {}
        }
        operatorInfo[0].voice[region][item.wordKey][item.voiceId] = {
          title: item.voiceTitle,
          text: item.voiceText.replace(/{@nickname}/g, NICKNAME[region]),
        }
      }
    })

  }

  async #zhTWDownload() {
    const output = {}
    const region = 'zh_TW'
    const historyResponse = await fetch(`https://api.github.com/repos/Kengxxiao/ArknightsGameData/commits?path=${region}/gamedata/excel/charword_table.json`)
    const handbookHistoryResponse = await fetch(`https://api.github.com/repos/Kengxxiao/ArknightsGameData/commits?path=${region}/gamedata/excel/handbook_info_table.json`)
    const historyData = await historyResponse.json()
    const handbookHistoryData = await handbookHistoryResponse.json()
    const lastCommit = historyData[0]
    const handboookLastCommit = handbookHistoryData[0]
    const lastCommitDate = new Date(lastCommit.commit.committer.date)
    const handbookLastCommitDate = new Date(handboookLastCommit.commit.committer.date)
    const filepath = path.join(this.#charwordTablePath, `charword_table_${region}_${lastCommitDate.getTime()}.json`)
    const handbookFilepath = path.join(this.#charwordTablePath, `handbook_info_table_${region}_${handbookLastCommitDate.getTime()}.json`)
    console.log(`Last commit date: ${lastCommitDate.getTime()}`)
    console.log(`Handbook last commit date: ${handbookLastCommitDate.getTime()}`)

    if (exists(filepath)) {
      console.log(`charword_table_${region}.json is the latest version.`)
      output.data = JSON.parse(readSync(filepath))
    } else {
      const response = await fetch(`https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/${region}/gamedata/excel/charword_table.json`)
      const data = await response.json()
      writeSync(JSON.stringify(data), filepath)
      console.log(`charword_table_${region}.json is updated.`)

      // remove old file
      const files = readdirSync(path.join(__projetRoot, __config.folder.operator, __config.folder.share))
      for (const file of files) {
        if (file.startsWith(`charword_table_${region}`) && file !== path.basename(filepath)) {
          rm(path.join(__projetRoot, __config.folder.operator, __config.folder.share, file))
        }
      }
      output.data = data
    }
    if (exists(handbookFilepath)) {
      console.log(`handbook_info_table_${region}.json is the latest version.`)
      output.handbook = JSON.parse(readSync(handbookFilepath))
    } else {
      const response = await fetch(`https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/${region}/gamedata/excel/handbook_info_table.json`)
      const data = await response.json()
      writeSync(JSON.stringify(data), handbookFilepath)
      console.log(`handbook_info_table_${region}.json is updated.`)

      // remove old file
      const files = readdirSync(path.join(__projetRoot, __config.folder.operator, __config.folder.share))
      for (const file of files) {
        if (file.startsWith(`handbook_info_table_${region}`) && file !== path.basename(handbookFilepath)) {
          rm(path.join(__projetRoot, __config.folder.operator, __config.folder.share, file))
        }
      }
      output.handbook = data
    }
    return output
  }
}
