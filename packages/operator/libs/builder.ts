import path from 'node:path'
import config from '@aklive2d/config'
import { alphaComposite, file } from '@aklive2d/libs'
import operators, {
    DIST_DIR,
    generateAssetsJson,
    OPERATOR_SOURCE_FOLDER,
} from '../index.ts'
import type { PortraitHub, PortraitJson } from '../types.ts'
import { getDistFolder, getExtractedFolder } from './utils.ts'

export const build = async (namesToBuild: string[]) => {
    const names = !namesToBuild.length ? Object.keys(operators) : namesToBuild
    console.log('Generating assets for', names.length, 'operators')
    for (const name of names) {
        await generateAssets(name)
        copyVoices(name)
    }
    copyLogos()
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
    ) as string
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
    ) as string
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
            isSP: operators[name].isSP,
        }
    )
}
