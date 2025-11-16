import path from 'node:path'
import config from '@aklive2d/config'
import { file } from '@aklive2d/libs'
import operators, {
    DIST_DIR,
    generateAssetsJson,
    OPERATOR_SOURCE_FOLDER,
} from '../index.ts'
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

    const portraitFilename = `${operators[name].portrait_filename}.png`
    await file.copy(
        path.join(extractedDir, portraitFilename),
        path.join(getDistFolder(name), portraitFilename)
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
