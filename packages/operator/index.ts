import path from 'node:path'
import { stringify } from 'yaml'
import { yaml, file, alphaComposite } from '@aklive2d/libs'
import config from '@aklive2d/config'
import { mapping as officialInfoMapping } from '@aklive2d/official-info'
import type { Config, PortraitHub, PortraitJson, AssetsJson } from './types.ts'

export const CONFIG_PATH = path.resolve(
    import.meta.dirname,
    config.module.operator.config_yaml
)
const CONFIG: Config = yaml.read(CONFIG_PATH)
export const OPERATOR_SOURCE_FOLDER = path.resolve(
    import.meta.dirname,
    config.dir_name.data
)
const DIST_DIR = path.join(import.meta.dirname, config.dir_name.dist)

const getVoiceFolders = (name: string) => {
    return config.dir_name.voice.sub.map((sub) =>
        path.join(
            OPERATOR_SOURCE_FOLDER,
            name,
            config.dir_name.voice.main,
            sub.name
        )
    )
}

const getExtractedFolder = (name: string) => {
    return path.join(OPERATOR_SOURCE_FOLDER, name, config.dir_name.extracted)
}

const getConfigFolder = () => {
    return path.join(import.meta.dirname, config.module.operator.config)
}

const getDistFolder = (name: string) => {
    return path.join(DIST_DIR, config.module.operator.operator, name)
}

export const has = (name: string) => {
    return Object.keys(operators).includes(name)
}

const generateMapping = () => {
    if (officialInfoMapping) {
        for (const [operatorName, operator] of Object.entries(CONFIG)) {
            const operatorInfo = officialInfoMapping[operator.official_id]
            // add title
            operator.title = `${config.module.operator.title['en-US']}${operator.codename['en-US']} - ${config.module.operator.title['zh-CN']}${operator.codename['zh-CN']}`
            // add type
            operator.type = operatorInfo.type

            // add link
            operator.link = operatorName

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

const copyVoices = (name: string) => {
    file.symlinkAll(
        path.join(OPERATOR_SOURCE_FOLDER, name, config.dir_name.voice.main),
        path.join(DIST_DIR, config.dir_name.voice.main, name)
    )
}

const copyLogos = () => {
    file.symlink(
        path.join(OPERATOR_SOURCE_FOLDER, config.module.operator.logos_assets),
        path.join(DIST_DIR, config.module.operator.logos)
    )
}

const operators = generateMapping()

export default operators

export function getOperatorId(name: string, matcher = '$2$3$4') {
    return name.replace(/^(.*)(char_[\d]+)(_[A-Za-z0-9]+)(|_.*)$/g, matcher)
}

export const getOperatorAlternativeId = (id: string) => {
    return getOperatorId(id, '$2$3')
}

export const build = async (namesToBuild: string[]) => {
    const names = !namesToBuild.length ? Object.keys(operators) : namesToBuild
    console.log('Generating assets for', names.length, 'operators')
    for (const name of names) {
        await generateAssets(name)
        copyVoices(name)
    }
    copyLogos()
}

const generateAssets = async (name: string) => {
    const extractedDir = getExtractedFolder(name)
    const outDir = getDistFolder(name)
    file.rmdir(outDir)
    file.mkdir(outDir)

    const fallback_name = operators[name].fallback_name
    const fallbackFilename = `${fallback_name}.png`
    const alphaCompositeFilename = `${path.parse(fallbackFilename).name}[alpha].png`
    if (file.exists(path.join(extractedDir, alphaCompositeFilename))) {
        const fallbackBuffer = await alphaComposite.process(
            fallbackFilename,
            alphaCompositeFilename,
            extractedDir
        )
        file.writeSync(
            fallbackBuffer,
            path.join(getDistFolder(name), fallbackFilename)
        )
    } else {
        await file.copy(
            path.join(extractedDir, fallbackFilename),
            path.join(getDistFolder(name), fallbackFilename)
        )
    }

    // generate portrait
    const portraitDir = path.join(
        OPERATOR_SOURCE_FOLDER,
        config.module.operator.portraits
    )
    const portraitHubContent = file.readSync(
        path.join(
            portraitDir,
            config.module.operator.MonoBehaviour,
            'portrait_hub.json'
        )
    )
    if (!portraitHubContent) throw new Error('portrait_hub.json not found')
    const portraitHub: PortraitHub = JSON.parse(portraitHubContent)
    const fallback_name_lowerCase = fallback_name.toLowerCase()
    const portraitItem = portraitHub._sprites.find(
        (item) => item.name.toLowerCase() === fallback_name_lowerCase
    )
    if (!portraitItem) throw new Error(`portrait ${fallback_name} not found`)
    const portraitAtlas = portraitItem.atlas
    const portraitJsonText = file.readSync(
        path.join(
            portraitDir,
            config.module.operator.MonoBehaviour,
            `portraits#${portraitAtlas}.json`
        )
    )
    if (!portraitJsonText)
        throw new Error(`portrait ${fallback_name} json not found`)
    const portraitJson: PortraitJson = JSON.parse(portraitJsonText)
    const item = portraitJson._sprites.find(
        (item) => item.name.toLowerCase() === fallback_name_lowerCase
    )
    if (!item) throw new Error(`portrait ${fallback_name} not found`)
    const rect = {
        ...item.rect,
        rotate: item.rotate,
    }
    const protraitFilename = `portraits#${portraitAtlas}.png`
    const portraitBuffer = await alphaComposite.process(
        protraitFilename,
        `${path.parse(protraitFilename).name}a.png`,
        path.join(portraitDir, config.module.operator.Texture2D)
    )
    const croppedBuffer = await alphaComposite.crop(portraitBuffer, rect)
    file.writeSync(
        croppedBuffer,
        path.join(getDistFolder(name), `${fallback_name}_portrait.png`)
    )

    await generateAssetsJson(
        operators[name].filename,
        extractedDir,
        getDistFolder(name),
        {
            useJSON: operators[name].use_json,
        }
    )
}

export const generateAssetsJson = async (
    filename: string,
    extractedDir: string,
    targetDir: string,
    _opts: {
        useJSON?: boolean
        useSymLink?: boolean
    } = {
        useJSON: false,
        useSymLink: true,
    }
) => {
    const assetsJson: AssetsJson = []

    let skelFilename
    if (_opts.useJSON) {
        skelFilename = `${filename}.json`
    } else {
        skelFilename = `${filename}.skel`
    }
    const atlasFilename = `${filename}.atlas`
    const atlasPath = path.join(extractedDir, atlasFilename)
    let atlas = await file.read(atlasPath)
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

export const init = (name: string, id: string) => {
    const voiceFolders = getVoiceFolders(name)
    const extractedFolder = getExtractedFolder(name)
    const operatorConfigFolder = getConfigFolder()
    const foldersToCreate = [extractedFolder, ...voiceFolders]

    const template = yaml.read(
        path.resolve(operatorConfigFolder, config.module.operator.template_yaml)
    )
    foldersToCreate.forEach((dir) => {
        file.mkdir(dir)
    })
    const currentOpertor = officialInfoMapping[id]
    if (currentOpertor === undefined) {
        throw new Error('Invalid operator id')
    }
    template.official_id = currentOpertor.id
    template.codename = currentOpertor.codename

    file.writeSync(
        stringify(template),
        path.resolve(operatorConfigFolder, `${name}.yaml`)
    )
    file.appendSync(
        `${name}: !include ${config.module.operator.config}/${name}.yaml\n`,
        CONFIG_PATH
    )
}
