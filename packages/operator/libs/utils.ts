import path from 'node:path'
import unidecode from 'unidecode'
import config from '@aklive2d/config'
import { DIST_DIR, OPERATOR_SOURCE_FOLDER } from '../index.ts'
import { file } from '@aklive2d/libs'
import {
    CharacterTableJson,
    SkinTableJson,
    OperatorEntryType,
    SkinTableJsonCharSkinEntry,
    Codename,
} from '../types.ts'
import type { OfficialInfoOperatorConfig } from '@aklive2d/official-info/types'

export const getExtractedFolder = (name: string) => {
    return path.join(OPERATOR_SOURCE_FOLDER, name, config.dir_name.extracted)
}

export const getDistFolder = (name: string) => {
    return path.join(DIST_DIR, config.module.operator.operator, name)
}

export const getVoiceFolders = (name: string) => {
    return config.dir_name.voice.sub.map((sub) =>
        path.join(
            OPERATOR_SOURCE_FOLDER,
            name,
            config.dir_name.voice.main,
            sub.name
        )
    )
}

export const findLogo = (characterTable: CharacterTableJson, id: string) => {
    const SEARCH_ORDER = ['teamId', 'groupId', 'nationId'] as const
    let logo: string | null = null
    const entry = characterTable[id]
    if (!entry) throw new Error(`Character ${id} not found`)
    for (const key of SEARCH_ORDER) {
        logo = entry[key]
        if (logo) break
    }
    if (logo === null) throw new Error(`Logo not found for character ${id}`)
    let invert_filter = true
    if (logo === 'rhodes') {
        logo = 'rhodes_override'
        invert_filter = false
    }
    logo = `logo_${logo}`
    const logoFiles = file
        .readdirSync(
            path.resolve(
                OPERATOR_SOURCE_FOLDER,
                config.module.operator.logos_assets
            )
        )
        .map((e) => {
            const name = path.parse(e).name
            return {
                file: name,
                name: name.toLowerCase(),
            }
        })
    const logoFile = logoFiles.find((f) => f.name === logo)
    if (!logoFile)
        throw new Error(`Logo file not found for character ${id}, ${logo}`)
    logo = logoFile.file

    return {
        logo,
        invert_filter,
    }
}

export const findSkinEntry = (
    skinTableJson: SkinTableJson,
    name: string,
    type: OperatorEntryType
) => {
    const OVERWRITE_ENTRIES = {
        WISADEL: "Wiš'adel",
    } as const
    type OverwriteKeys = keyof typeof OVERWRITE_ENTRIES

    name = OVERWRITE_ENTRIES[name as OverwriteKeys] ?? name
    const dynSkinEntries = Object.values(skinTableJson.charSkins).filter(
        (entry) => entry.dynIllustId !== null
    )
    let entry: SkinTableJsonCharSkinEntry | undefined
    if (type === 'operator') {
        entry = dynSkinEntries.find(
            (e) => e.displaySkin.modelName?.toLowerCase() === name.toLowerCase()
        )
    } else if (type === 'skin') {
        entry = dynSkinEntries.find(
            (e) => e.displaySkin.skinName?.toLowerCase() === name.toLowerCase()
        )
    } else {
        throw new Error(`Invalid type: ${type}`)
    }
    if (!entry) throw new Error(`Skin entry not found for ${name}`)
    return entry
}

/**
 * Name from Official Info sometimes is incorrect, can only be used as a
 * reference
 * @param skinEntry
 * @param officialInfo
 * @returns
 */
export const findCodename = (
    skinEntry: SkinTableJsonCharSkinEntry,
    officialInfo: OfficialInfoOperatorConfig
) => {
    const UPPER_CASE_EXCEPTION_WORDS = [
        'the',
        'is',
        'of',
        'and',
        'for',
        'a',
        'an',
        'are',
        'in',
        'as',
    ]
    const codename: Codename = { 'zh-CN': '', 'en-US': '' }
    const regexp = /[^(\w) ]/
    let modelNameNormalized = skinEntry.displaySkin.modelName
    const hasSpecialCharInModelName = regexp.test(
        skinEntry.displaySkin.modelName
    )
    if (hasSpecialCharInModelName) {
        modelNameNormalized = unidecode(modelNameNormalized).replace(regexp, '')
        const modelNameArray = skinEntry.displaySkin.modelName.split(' ')
        const modelNameNormalizedArray = modelNameNormalized.split(' ')
        modelNameArray.forEach((word, index) => {
            if (word !== modelNameNormalizedArray[index]) {
                modelNameNormalizedArray[index] =
                    `${word}/${modelNameNormalizedArray[index]}`
            }
        })
        modelNameNormalized = modelNameNormalizedArray.join(' ')
    }
    if (skinEntry.displaySkin.skinName) {
        let engSkinName = officialInfo.codename['en-US']
        const engkinNameArray = engSkinName.split(' ')
        engkinNameArray.forEach((word, index) => {
            if (/^[a-zA-Z]+$/.test(word)) {
                word = word.toLowerCase()
                if (UPPER_CASE_EXCEPTION_WORDS.includes(word)) {
                    engkinNameArray[index] = word
                } else {
                    engkinNameArray[index] =
                        word[0].toUpperCase() + word.slice(1)
                }
            }
        })
        engSkinName = engkinNameArray.join(' ')
        codename['zh-CN'] = officialInfo.codename['zh-CN'].replace(/ +$/, '')
        codename['en-US'] = `${engSkinName} / ${modelNameNormalized}`
    } else {
        codename['zh-CN'] = officialInfo.codename['zh-CN'].replace(/ +$/, '')
        codename['en-US'] = modelNameNormalized
    }
    return codename
}

export const getActualFilename = (filename: string, dir: string) => {
    const files = file.readdirSync(dir)
    const actualFilename = files.find((e) => {
        const name = path.parse(e).name
        return filename.startsWith(name) && !name.endsWith('_Start')
    })
    return actualFilename ? path.parse(actualFilename).name : filename
}

export const findSkel = (name: string, dir: string) => {
    const files = file.readdirSync(dir)
    const skel = files.find((e) => {
        const actualName = path.parse(e)
        return (
            name.startsWith(actualName.name) &&
            !actualName.name.endsWith('_Start') &&
            actualName.ext === '.skel'
        )
    })
    const json = files.find((e) => {
        const actualName = path.parse(e)
        return (
            name.startsWith(actualName.name) &&
            !actualName.name.endsWith('_Start') &&
            actualName.ext === '.json'
        )
    })
    if (skel) {
        return skel
    } else if (json) {
        return json
    } else {
        throw new Error('No skel or json file found')
    }
}
