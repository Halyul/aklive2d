import path from 'node:path'
import sharp from 'sharp'
import { file } from '@aklive2d/libs'
import config from '@aklive2d/config'
import { mapping as musicMapping } from '@aklive2d/music'

export const BACKGROUND_DIR = path.join(
    import.meta.dirname,
    config.dir_name.data
)
const DIST_DIR = path.resolve(import.meta.dirname, config.dir_name.dist)
const EXTRACTED_DIR = path.join(BACKGROUND_DIR, config.dir_name.extracted)
const DEFAULT_BACKGROUND_FILE = path.join(
    BACKGROUND_DIR,
    config.module.background.operator_bg_png
)

const getFiles = () => {
    const ret = file.readdirSync(DIST_DIR)
    ret.unshift(
        ret.splice(
            ret.findIndex(
                (e) => e === config.module.background.operator_bg_png
            ),
            1
        )[0]
    )
    return ret
}

export let files = getFiles()

const filesToBuild = file.readdirSync(EXTRACTED_DIR).filter((f) => {
    return f.endsWith('.png') && f.includes('_left')
})

export const build = async () => {
    const err = []
    file.mkdir(DIST_DIR)
    await Promise.all(
        filesToBuild.map(async (f) => {
            const filenamePrefix = path.parse(f).name.replace('_left', '')
            await composite(filenamePrefix, '.png')
        })
    )
    await file.copy(
        DEFAULT_BACKGROUND_FILE,
        path.join(DIST_DIR, config.module.background.operator_bg_png)
    )

    const { musicFiles, musicFileMapping } = musicMapping

    for (const e of musicFiles) {
        const musicPath = path.join(e.source, e.filename)
        if (!file.exists(musicPath)) {
            err.push(`Music file ${e.filename} is not found in music folder.`)
        }
    }
    files = getFiles()
    for (const e of Object.keys(musicFileMapping)) {
        if (!files.includes(e)) {
            err.push(`Background file ${e} is not found in background folder.`)
        }
    }

    return err
}

const composite = async (filenamePrefix: string, fileExt: string) => {
    const image = sharp(
        path.join(EXTRACTED_DIR, `${filenamePrefix}_left${fileExt}`)
    )
    const metadata = await image.metadata()

    if (!metadata.width || !metadata.height) {
        throw new Error(
            `Width and height metadata for ${filenamePrefix}_left${fileExt} is not found.`
        )
    }

    image
        .resize(2 * metadata.width, metadata.height, {
            kernel: sharp.kernel.nearest,
            fit: 'contain',
            position: 'left top',
            background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .composite([
            {
                input: path.join(
                    EXTRACTED_DIR,
                    `${filenamePrefix}_right${fileExt}`
                ),
                top: 0,
                left: metadata.width,
            },
        ])
        .toFile(path.join(DIST_DIR, `${filenamePrefix}${fileExt}`))
}
