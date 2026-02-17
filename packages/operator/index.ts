import path from 'node:path'
import config from '@aklive2d/config'
import { alphaComposite, envParser, file, yaml } from '@aklive2d/libs'
import { mapping as officialInfoMapping } from '@aklive2d/official-info'
import { TitleLanguages } from './../config/types'
import {
    findLogo,
    findSkel,
    findSkinEntry,
    getActualFilename,
} from './libs/utils.ts'
import type {
    AssetsJson,
    CharacterTableJson,
    Config,
    SkinTableJson,
} from './types.ts'

export const AUTO_UPDATE_FOLDER = path.resolve(
    import.meta.dirname,
    config.dir_name.auto_update
)

export const CONFIG_PATH = path.resolve(
    import.meta.dirname,
    config.module.operator.config_yaml
)
const CONFIG: Config = yaml.read(CONFIG_PATH)
export const OPERATOR_SOURCE_FOLDER = path.resolve(
    import.meta.dirname,
    config.dir_name.data
)
export const DIST_DIR = path.join(import.meta.dirname, config.dir_name.dist)
export const CONFIG_FOLDER = path.resolve(
    import.meta.dirname,
    config.module.operator.config
)

export const has = (name: string) => {
    return Object.keys(operators).includes(name)
}

export function getOperatorId(name: string, matcher = '$2$3$4') {
    return name.replace(/^(.*)(char_[\d]+)(_[A-Za-z0-9]+)(|_.*)$/g, matcher)
}

export const getOperatorAlternativeId = (id: string) => {
    return getOperatorId(id, '$2$3')
}

export const generateAssetsJson = async (
    filename: string,
    extractedDir: string,
    targetDir: string,
    _opts: {
        isSP?: boolean
        useSymLink?: boolean
    } = {
        isSP: false,
        useSymLink: true,
    }
) => {
    const assetsJson: AssetsJson = []

    /*
     * Special Cases:
     * - ines_melodic_flutter
     */
    filename = getActualFilename(filename, extractedDir, _opts.isSP)

    const skelFilename = findSkel(filename, extractedDir)
    const atlasFilename = `${filename}.atlas`
    const atlasPath = path.join(extractedDir, atlasFilename)
    let atlas = file.readSync(atlasPath) as string
    const matches = atlas.match(new RegExp(/(.*).png/g))
    if (!matches)
        throw new Error(`No matches found in atlas file ${atlasFilename}`)
    for (const item of matches) {
        let buffer
        const alphaCompositeFilename = `${path.parse(item).name}[alpha].png`
        if (file.exists(path.join(extractedDir, alphaCompositeFilename))) {
            buffer = await alphaComposite.process(
                item,
                alphaCompositeFilename,
                extractedDir
            )
        } else {
            buffer = await alphaComposite.toBuffer(item, extractedDir)
        }
        assetsJson.push({
            filename: item,
            content: buffer,
        })
        atlas = atlas.replace(item, item.replace(/#/g, '%23'))
    }
    assetsJson.push({
        filename: skelFilename,
        path: path.join(extractedDir, skelFilename),
    })
    assetsJson.push({
        filename: atlasFilename,
        content: atlas,
    })
    assetsJson.map((item) => {
        const dir = path.join(targetDir, item.filename)
        if (item.content) {
            file.writeSync(item.content, dir)
        } else if (item.path) {
            if (_opts.useSymLink) {
                file.symlink(item.path, dir)
            } else {
                file.cpSync(item.path, dir)
            }
        } else {
            throw new Error(`Invalid asset item: ${item}`)
        }
    })
}

const characterTable = (() => {
    const character_table_json = path.resolve(
        AUTO_UPDATE_FOLDER,
        config.module.operator.character_table_json
    )
    const t = file.readSync(character_table_json, {
        useAsPrefix: true,
    }) as string
    if (!t) throw new Error('character_table.json not found')
    return JSON.parse(t) as CharacterTableJson
})()

export const skinTable = (() => {
    const skinTable = path.resolve(
        AUTO_UPDATE_FOLDER,
        config.module.operator.skin_table_json
    )
    const t = file.readSync(skinTable, {
        useAsPrefix: true,
    }) as string
    if (!t) throw new Error('skin_table.json not found')
    return JSON.parse(t) as SkinTableJson
})()

const generateMapping = () => {
    if (officialInfoMapping) {
        const { mode } = envParser.parse({
            mode: {
                type: 'string',
                short: 'm',
            },
        })
        for (const [operatorName, operator] of Object.entries(CONFIG)) {
            const operatorInfo = officialInfoMapping[operator.official_id]
            const type = operatorInfo.type
            const name =
                type === 'skin'
                    ? operatorInfo.skinName['zh-CN']
                    : operatorInfo.skinName['en-US']
            const skinEntry = findSkinEntry(skinTable, name, type)
            operator.filename = skinEntry.dynIllustId.replace(/_2$/, '')
            operator.portrait_filename =
                type === 'skin'
                    ? skinEntry.skinId.replace(/@/, '_')
                    : `${skinEntry.charId}_2`

            const regions = Object.keys(
                operator.codename
            ) as (keyof TitleLanguages)[]
            if (operator.isSP) {
                regions.forEach((region: keyof TitleLanguages) => {
                    operator.codename[region] =
                        `${config.module.operator.sp_title[region]}${operator.codename[region]}`
                })
            }
            // add title
            operator.title = regions
                .map(
                    (region: keyof TitleLanguages) =>
                        `${config.module.operator.title[region]}${operator.codename[region]}`
                )
                .join(' - ')

            // add type
            operator.type = operatorInfo.type

            // add link
            operator.link = operatorName

            // add default viewport
            if (!operator.viewport_left) operator.viewport_left = 0
            if (!operator.viewport_right) operator.viewport_right = 0
            if (!operator.viewport_top) operator.viewport_top = 0
            if (!operator.viewport_bottom) operator.viewport_bottom = 0

            operator.voice_id = skinEntry.voiceId

            if (mode !== 'update') {
                const logo = findLogo(characterTable, skinEntry.charId)
                operator.logo = logo.logo
                operator.invert_filter = logo.invert_filter
            }

            operator.color =
                skinEntry.displaySkin.colorList.find((e) => e !== '') || '#000'

            // id
            operator.id = getOperatorId(operator.filename).replace(
                /^(char_)(\d+)(_.+)$/g,
                '$2'
            )

            operator.date = operatorInfo.date
        }
    }

    return CONFIG
}

const operators = generateMapping()

export default operators
