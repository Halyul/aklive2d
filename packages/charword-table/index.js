import path from 'node:path'
import { file } from '@aklive2d/libs'
import Downloader from '@aklive2d/downloader'
import config from '@aklive2d/config'
import operators, {
    getOperatorId,
    OPERATOR_SOURCE_FOLDER,
} from '@aklive2d/operator'

// zh_TW uses an older version of charword_table.json
// zh_TW is removed
const REGIONS = ['zh_CN', 'en_US', 'ja_JP', 'ko_KR']
const REGION_URLS = {
    zh_CN: 'Kengxxiao/ArknightsGameData',
    en_US: 'Kengxxiao/ArknightsGameData_YoStar',
    ja_JP: 'Kengxxiao/ArknightsGameData_YoStar',
    ko_KR: 'Kengxxiao/ArknightsGameData_YoStar',
}
const DEFAULT_REGION = REGIONS[0]
export const defaultRegion = DEFAULT_REGION.replace('_', '-')
const NICKNAME = {
    zh_CN: '博士',
    en_US: 'Doctor',
    ja_JP: 'ドクター',
    ko_KR: '박사',
    zh_TW: '博士',
}

const OPERATOR_IDS = Object.values(operators).map((operator) => {
    return getOperatorId(operator)
})
const AUTO_UPDATE_FOLDER = path.resolve(
    import.meta.dirname,
    config.dir_name.auto_update
)
const CHARWORD_TABLE_FILE = path.resolve(
    AUTO_UPDATE_FOLDER,
    config.module.charword_table.charword_table_json
)
const CHARWORD_TABLE = JSON.parse(file.readSync(CHARWORD_TABLE_FILE)) || {}
const DIST_DIR = path.resolve(import.meta.dirname, config.dir_name.dist)

export const lookup = (operatorName) => {
    const operatorId = getOperatorId(operators[operatorName])
    const operatorBlock = CHARWORD_TABLE[operatorId]
    return operatorBlock.ref
        ? CHARWORD_TABLE[operatorBlock.alternativeId]
        : operatorBlock
}

const getDistDir = (name) => {
    return path.join(
        DIST_DIR,
        name,
        config.module.charword_table.charword_table_json
    )
}

export const getLangs = (name, voiceJson = null) => {
    voiceJson = voiceJson
        ? voiceJson
        : JSON.parse(file.readSync(getDistDir(name)))
    const voiceLangs = Object.keys(voiceJson.voiceLangs['zh-CN'])
    const subtitleLangs = Object.keys(voiceJson.subtitleLangs)
    return { voiceLangs, subtitleLangs }
}

export const build = async (namesToBuild) => {
    const err = []
    const names = !namesToBuild.length ? Object.keys(operators) : namesToBuild
    console.log('Generating charword_table for', names.length, 'operators')
    await updateFn(true)
    for (const name of names) {
        const charwordTableLookup = lookup(name)
        const voiceJson = {}
        voiceJson.voiceLangs = {}
        voiceJson.subtitleLangs = {}
        const subtitleInfo = Object.keys(charwordTableLookup.info)
        subtitleInfo.forEach((item) => {
            if (Object.keys(charwordTableLookup.info[item]).length > 0) {
                const key = item.replace('_', '-')
                voiceJson.subtitleLangs[key] = {}
                for (const [id, subtitles] of Object.entries(
                    charwordTableLookup.voice[item]
                )) {
                    const match = id.replace(/(.+?)([A-Z]\w+)/, '$2')
                    if (match === id) {
                        voiceJson.subtitleLangs[key].default = subtitles
                    } else {
                        voiceJson.subtitleLangs[key][match] = subtitles
                    }
                }
                voiceJson.voiceLangs[key] = {}
                Object.values(charwordTableLookup.info[item]).forEach(
                    (item) => {
                        voiceJson.voiceLangs[key] = {
                            ...voiceJson.voiceLangs[key],
                            ...item,
                        }
                    }
                )
            }
        })
        let voiceLangs = []
        try {
            voiceLangs = getLangs(name, voiceJson).voiceLangs

            file.writeSync(JSON.stringify(voiceJson), getDistDir(name))
        } catch (e) {
            console.log(`charword_table is not available`, e)
        }

        // check whether voice files has been added
        const customVoiceName = voiceLangs.filter(
            (i) => !config.dir_name.voice.sub.map((e) => e.lang).includes(i)
        )[0]
        const voiceLangMapping = config.dir_name.voice.sub
            .filter((e) => {
                return (
                    voiceLangs.includes(e.lang) ||
                    (e.lang === 'CUSTOM' &&
                        typeof customVoiceName !== 'undefined')
                )
            })
            .map((e) => {
                return {
                    name: e.name,
                    lang: e.lang === 'CUSTOM' ? customVoiceName : e.lang,
                }
            })
        for (const voiceSubFolderMapping of voiceLangMapping) {
            const voiceSubFolder = path.join(
                OPERATOR_SOURCE_FOLDER,
                name,
                config.dir_name.voice.main,
                voiceSubFolderMapping.name
            )
            if (file.readdirSync(voiceSubFolder).length === 0) {
                err.push(
                    `Voice folder ${voiceSubFolderMapping.name} for ${name} is empty.`
                )
            }
        }
    }

    return err
}

export const update = async () => {
    await updateFn()
    file.writeSync(JSON.stringify(CHARWORD_TABLE), CHARWORD_TABLE_FILE)
}

const updateFn = async (isLocalOnly = false) => {
    const regionObject = REGIONS.reduce(
        (acc, cur) => ({ ...acc, [cur]: {} }),
        {}
    )
    OPERATOR_IDS.forEach((id) => {
        CHARWORD_TABLE[id] = {
            alternativeId: id.replace(
                /^(char_)([\d]+)(_[\w]+)(|(_.+))$/g,
                '$1$2$3'
            ),
            voice: structuredClone(regionObject),
            info: structuredClone(regionObject),
        }
    })
    await load(DEFAULT_REGION, isLocalOnly)
    await Promise.all(
        REGIONS.slice(1).map(async (region) => {
            await load(region, isLocalOnly)
        })
    )
}

const load = async (region, isLocalOnly = false) => {
    const basename = `charword_table_${region}`
    const filename = file
        .readdirSync(AUTO_UPDATE_FOLDER)
        .filter((item) => item.startsWith(`charword_table_${region}`))[0]
    const localFilePath = path.join(AUTO_UPDATE_FOLDER, filename)
    const data = isLocalOnly
        ? JSON.parse(file.readSync(localFilePath))
        : await download(
              region,
              path.join(path.dirname(localFilePath), `${basename}.json`)
          )

    // put voice actor info into charword_table
    for (const [id, element] of Object.entries(CHARWORD_TABLE)) {
        let operatorId = id
        let useAlternativeId = false
        if (typeof data.voiceLangDict[operatorId] === 'undefined') {
            operatorId = element.alternativeId
            useAlternativeId = true
        }
        if (region === DEFAULT_REGION) {
            element.infile = OPERATOR_IDS.includes(operatorId)
            element.ref = useAlternativeId && element.infile
        }
        // not available in other region
        if (typeof data.voiceLangDict[operatorId] === 'undefined') {
            console.log(
                `Voice actor info of ${id} is not available in ${region}.`
            )
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
        Object.values(data.voiceLangDict[operatorId].dict).forEach((item) => {
            if (typeof element.info[region][item.wordkey] === 'undefined') {
                element.info[region][item.wordkey] = {}
            }
            element.info[region][item.wordkey][item.voiceLangType] = [
                ...(typeof item.cvName === 'string'
                    ? [item.cvName]
                    : item.cvName),
            ]
        })
    }

    // put voice lines into charword_table
    Object.values(data.charWords).forEach((item) => {
        const operatorInfo = Object.values(CHARWORD_TABLE).filter(
            (element) => element.info[region][item.wordKey]
        )
        if (operatorInfo.length > 0) {
            for (const operator of operatorInfo) {
                if (
                    typeof operator.voice[region][item.wordKey] === 'undefined'
                ) {
                    operator.voice[region][item.wordKey] = {}
                }
                operator.voice[region][item.wordKey][item.voiceId] = {
                    title: item.voiceTitle,
                    text: item.voiceText.replace(
                        /{@nickname}/g,
                        NICKNAME[region]
                    ),
                }
            }
        }
    })
}

const download = async (region, targetFilePath) => {
    return await new Downloader().github(
        `https://api.github.com/repos/${REGION_URLS[region]}/commits?path=${region}/gamedata/excel/charword_table.json`,
        `https://raw.githubusercontent.com/${REGION_URLS[region]}/master/${region}/gamedata/excel/charword_table.json`,
        targetFilePath
    )
}
