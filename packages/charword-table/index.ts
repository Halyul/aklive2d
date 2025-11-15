import path from 'node:path'
import config from '@aklive2d/config'
import { githubDownload } from '@aklive2d/downloader'
import { file } from '@aklive2d/libs'
import operators, {
    getOperatorAlternativeId,
    getOperatorId,
    OPERATOR_SOURCE_FOLDER,
} from '@aklive2d/operator'
import type {
    CharwordTable,
    CharwordTableJson,
    InfoRegionObject,
    OperatorCharwordTable,
    Region,
    VoiceRegionObject,
} from './types.ts'

// zh_TW uses an older version of charword_table.json
// zh_TW is removed
const REGIONS: Region[] = ['zh_CN', 'en_US', 'ja_JP', 'ko_KR']

const REGION_URLS = {
    zh_CN: 'Kengxxiao/ArknightsGameData',
    en_US: 'Kengxxiao/ArknightsGameData_YoStar',
    ja_JP: 'Kengxxiao/ArknightsGameData_YoStar',
    ko_KR: 'Kengxxiao/ArknightsGameData_YoStar',
}
const DEFAULT_REGION: Region = REGIONS[0]
export const defaultRegion = DEFAULT_REGION.replace('_', '-')
const NICKNAME = {
    zh_CN: '博士',
    en_US: 'Doctor',
    ja_JP: 'ドクター',
    ko_KR: '박사',
    zh_TW: '博士',
}

const OPERATOR_IDS = Object.values(operators).map((operator) => {
    return getOperatorId(operator.filename)
})
const AUTO_UPDATE_FOLDER = path.resolve(
    import.meta.dirname,
    config.dir_name.auto_update
)

const DIST_DIR = path.resolve(import.meta.dirname, config.dir_name.dist)

const lookup = (operatorName: string, charwordTable: CharwordTable) => {
    const operatorId = getOperatorId(operators[operatorName].filename)
    const operatorBlock = charwordTable[operatorId]
    return operatorBlock.ref
        ? charwordTable[operatorBlock.alternativeId]
        : operatorBlock
}

const getDistDir = (name: string) => {
    return path.join(
        DIST_DIR,
        name,
        config.module.charword_table.charword_table_json
    )
}

export const getLangs = (
    name: string,
    voiceJson: OperatorCharwordTable | null = null
) => {
    let data: OperatorCharwordTable
    if (!voiceJson) {
        const text = file.readSync(getDistDir(name))
        if (!text) throw new Error(`File not found: ${getDistDir(name)}`)
        data = JSON.parse(text)
    } else {
        data = voiceJson
    }
    const voiceLangs = Object.keys(data.voiceLangs['zh-CN'])
    const subtitleLangs = Object.keys(data.subtitleLangs)
    return { voiceLangs, subtitleLangs }
}

export const build = async (namesToBuild: string[]) => {
    const err: string[] = []
    const names = !namesToBuild.length ? Object.keys(operators) : namesToBuild
    console.log('Generating charword_table for', names.length, 'operators')
    const charwordTable = await updateFn(true)
    for (const name of names) {
        const charwordTableLookup = lookup(name, charwordTable)
        const voiceJson = {} as OperatorCharwordTable
        voiceJson.voiceLangs = {}
        voiceJson.subtitleLangs = {}
        const subtitleInfo = Object.keys(charwordTableLookup.info) as Region[]
        const voiceList = {} as {
            [key: string]: string[]
        }
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
                        voiceList[key] = Object.keys(subtitles)
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
        let voiceLangs = [] as string[]
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
                    lookup_region: e.lookup_region.replace('_', '-'),
                }
            })
        for (const voiceSubFolderMapping of voiceLangMapping) {
            const voiceSubFolder = path.join(
                OPERATOR_SOURCE_FOLDER,
                name,
                config.dir_name.voice.main,
                voiceSubFolderMapping.name
            )
            const voiceFileList = file.readdirSync(voiceSubFolder)
            voiceList[voiceSubFolderMapping.lookup_region].map((item) => {
                if (
                    !voiceFileList.includes(`${item}.ogg`)
                ) {
                    err.push(
                        `Voice folder ${voiceSubFolderMapping.name} for ${name} is missing ${item}.ogg`
                    )
                }
            })
        }
    }

    return err
}

export const update = async () => {
    await updateFn()
}

const updateFn = async (isLocalOnly = false) => {
    const regionObject = REGIONS.reduce(
        (acc, cur) => ({ ...acc, [cur]: {} }),
        {}
    )
    const charwordTable = {} as CharwordTable
    OPERATOR_IDS.forEach((id) => {
        charwordTable[id] = {
            alternativeId: getOperatorAlternativeId(id),
            voice: structuredClone(regionObject) as VoiceRegionObject,
            info: structuredClone(regionObject) as InfoRegionObject,
            infile: false,
            ref: false,
        }
    })
    await load(DEFAULT_REGION, charwordTable, isLocalOnly)
    await Promise.all(
        REGIONS.slice(1).map(async (region) => {
            await load(region, charwordTable, isLocalOnly)
        })
    )
    return charwordTable
}

const load = async (
    region: Region,
    charwordTable: CharwordTable,
    isLocalOnly = false
) => {
    const basename = `charword_table_${region}`
    const filename = file
        .readdirSync(AUTO_UPDATE_FOLDER)
        .filter((item) => item.startsWith(`charword_table_${region}`))[0]
    const localFilePath = path.join(AUTO_UPDATE_FOLDER, filename)
    let data: CharwordTableJson

    const getOnlineData = async () => {
        return await download(
            region,
            path.join(path.dirname(localFilePath), `${basename}.json`)
        )
    }

    if (isLocalOnly) {
        const text = file.readSync(localFilePath)
        if (!text) {
            data = await getOnlineData()
        } else {
            data = JSON.parse(text)
        }
    } else {
        data = await getOnlineData()
    }

    // put voice actor info into charword_table
    for (const [id, element] of Object.entries(charwordTable)) {
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
        const operatorInfo = Object.values(charwordTable).filter(
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

    return charwordTable
}

const download = async (
    region: keyof typeof REGION_URLS,
    targetFilePath: string
) => {
    return await githubDownload(
        `https://api.github.com/repos/${REGION_URLS[region]}/commits?path=${region}/gamedata/excel/charword_table.json`,
        `https://raw.githubusercontent.com/${REGION_URLS[region]}/master/${region}/gamedata/excel/charword_table.json`,
        targetFilePath
    )
}
