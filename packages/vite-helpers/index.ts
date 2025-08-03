import path from 'node:path'
import config from '@aklive2d/config'
import operators, {
    OPERATOR_SOURCE_FOLDER,
    generateAssetsJson,
} from '@aklive2d/operator'
import {
    getExtractedFolder,
    getActualFilename,
    findSkel,
} from '@aklive2d/operator/libs/utils'
import type { OperatorConfig } from '@aklive2d/operator/types'
import { DIST_DIR as ASSETS_DIST_DIR } from '@aklive2d/assets'
import { file, env } from '@aklive2d/libs'
import { files as backgroundFiles } from '@aklive2d/background'
import { mapping as musicMapping } from '@aklive2d/music'
import { defaultRegion } from '@aklive2d/charword-table'
import type { ProjectJSON } from '@aklive2d/project-json/types'

interface DirectoryOperatorConfig extends OperatorConfig {
    workshopId: string | null
}

const SPINE_FILENAME_PREFIX = 'dyn_illust_'

export const copyShowcaseData = (
    name: string,
    {
        dataDir,
        publicAssetsDir,
        mode,
    }: { dataDir: string; publicAssetsDir: string; mode: string }
) => {
    file.mkdir(publicAssetsDir)
    const operatorAssetsDir = path.join(
        ASSETS_DIST_DIR,
        config.module.operator.operator,
        name
    )
    const spineFilenames = file
        .readdirSync(operatorAssetsDir)
        .filter((item) =>
            item.startsWith(
                operators[name].isSP
                    ? `${config.module.operator.sp_filename_prefix}${SPINE_FILENAME_PREFIX}`
                    : SPINE_FILENAME_PREFIX
            )
        )
    const q = [
        {
            fn: file.symlink,
            source: path.resolve(
                ASSETS_DIST_DIR,
                config.module.assets.background
            ),
            target: path.resolve(
                publicAssetsDir,
                config.module.assets.background
            ),
            condition: mode !== 'build:directory',
        },
        {
            fn: file.symlink,
            source: path.resolve(ASSETS_DIST_DIR, config.module.assets.music),
            target: path.resolve(publicAssetsDir, config.module.assets.music),
            condition: mode !== 'build:directory',
        },
        {
            fn: file.symlinkAll,
            source: path.resolve(
                ASSETS_DIST_DIR,
                config.dir_name.voice.main,
                name
            ),
            target: path.resolve(publicAssetsDir, config.dir_name.voice.main),
        },
        {
            fn: file.symlink,
            filename: `${operators[name].fallback_name}.png`,
            source: path.resolve(
                ASSETS_DIST_DIR,
                config.module.operator.operator,
                name
            ),
            target: path.resolve(publicAssetsDir),
        },
        {
            fn: file.symlink,
            filename: `${operators[name].logo}.png`,
            source: path.resolve(ASSETS_DIST_DIR, config.module.operator.logos),
            target: path.resolve(publicAssetsDir),
            condition: mode !== 'build:directory',
        },
        {
            fn: file.symlink,
            filename: config.module.charword_table.charword_table_json,
            source: path.resolve(
                ASSETS_DIST_DIR,
                config.module.assets.charword_table,
                name
            ),
            target: path.resolve(publicAssetsDir),
        },
    ]
    spineFilenames.map((filename) => {
        q.push({
            fn: file.symlink,
            filename,
            source: operatorAssetsDir,
            target: path.resolve(publicAssetsDir),
        })
    })
    q.map(({ fn, filename, source, target, condition = true }) => {
        if (condition) {
            if (filename) {
                source = path.resolve(source, filename)
                target = path.resolve(target, filename)
            }
            fn(source, target)
        }
    })
    const filename = getActualFilename(
        operators[name].filename,
        getExtractedFolder(name),
        operators[name].isSP
    )
    const buildConfig = {
        insight_id: config.insight.id,
        link: operators[name].link,
        filename: filename.replace(/#/g, '%23'),
        logo_filename: operators[name].logo,
        fallback_filename: operators[name].fallback_name.replace(/#/g, '%23'),
        viewport_left: operators[name].viewport_left,
        viewport_right: operators[name].viewport_right,
        viewport_top: operators[name].viewport_top,
        viewport_bottom: operators[name].viewport_bottom,
        invert_filter: operators[name].invert_filter,
        image_width: 2048,
        image_height: 2048,
        default_background: config.module.background.operator_bg_png,
        background_files: backgroundFiles,
        background_folder: config.module.assets.background,
        voice_default_region: defaultRegion,
        voice_folders: config.dir_name.voice,
        music_folder: config.module.assets.music,
        music_mapping: musicMapping.musicFileMapping,
        use_json: findSkel(filename, getExtractedFolder(name)).endsWith('json'),
        default_assets_dir: `${config.app.showcase.assets}/`,
        logo_dir:
            mode === 'build:directory'
                ? `${config.module.operator.logos}/`
                : '',
        build_assets_dir:
            mode === 'build:directory'
                ? `../${config.app.directory.assets}/`
                : `${config.app.showcase.assets}/`, // default is assets/, on build:directory mode is ../_assets
    }
    file.writeSync(
        JSON.stringify(buildConfig),
        path.join(path.resolve(dataDir), config.module.vite_helpers.config_json)
    )
    file.writeSync(
        env.generate([
            {
                key: 'app_title',
                value: operators[name].title,
            },
            {
                key: 'insight_url',
                value: config.insight.url,
            },
        ]),
        path.join(path.resolve(dataDir), '.env')
    )

    return buildConfig
}

export const copyProjectJSON = (
    name: string,
    { releaseDir }: { releaseDir: string }
) => {
    file.cpSync(
        path.resolve(ASSETS_DIST_DIR, config.module.assets.project_json, name),
        path.resolve(releaseDir),
        {
            dereference: true,
        }
    )
}

export const copyDirectoryData = async ({
    dataDir,
    publicDir,
}: {
    dataDir: string
    publicDir: string
}) => {
    file.mkdir(publicDir)
    const extractedFolder = path.join(
        OPERATOR_SOURCE_FOLDER,
        config.module.operator.directory_assets
    )
    const targetFolder = path.join(publicDir, config.app.directory.assets)
    const sourceFolder = path.join(ASSETS_DIST_DIR)
    const operatorFilesToCopy = Object.keys(operators)
    const operatorConfig = Object.values(
        Object.values(operators).reduce(
            (acc, cur) => {
                const curD = cur as DirectoryOperatorConfig
                curD.filename = getActualFilename(
                    operators[curD.link].filename,
                    getExtractedFolder(curD.link),
                    operators[curD.link].isSP
                )
                curD.use_json = findSkel(
                    curD.filename,
                    getExtractedFolder(curD.link)
                ).endsWith('json')
                const date = curD.date

                curD.workshopId = null
                const text = file.readSync(
                    path.join(
                        ASSETS_DIST_DIR,
                        config.module.assets.project_json,
                        cur.link,
                        config.module.project_json.project_json
                    )
                ) as string
                if (!text) {
                    console.log(`No workshop id for ${cur.link}!`)
                } else {
                    curD.workshopId = (
                        JSON.parse(text) as ProjectJSON
                    ).workshopid
                }

                if (acc[date]) {
                    acc[date].push(curD)
                } else {
                    acc[date] = [curD]
                }

                return acc
            },
            {} as {
                [date: string]: DirectoryOperatorConfig[]
            }
        )
    ).sort((a, b) => Date.parse(b[0].date) - Date.parse(a[0].date))
    await Promise.all(
        config.app.directory.error.files.map(async (key) => {
            await generateAssetsJson(key.key, extractedFolder, targetFolder, {
                useSymLink: false,
            })
        })
    )

    const directoryConfig = {
        insight_id: config.insight.id,
        app_voice_url: config.app.directory.voice,
        voice_folders: config.dir_name.voice,
        directory_folder: config.app.directory.assets,
        default_background: config.module.background.operator_bg_png,
        background_files: backgroundFiles,
        background_folder: config.module.assets.background,
        available_operators: Object.keys(operators),
        error_files: config.app.directory.error,
        music_folder: config.module.assets.music,
        music_mapping: musicMapping.musicFileMapping,
        operators: operatorConfig,
        default_assets_dir: `${config.app.showcase.assets}/`,
        logo_dir: `${config.module.operator.logos}/`,
        portraits: `${config.app.directory.portraits}/`,
    }
    file.writeSync(
        JSON.stringify(directoryConfig),
        path.join(dataDir, config.module.vite_helpers.config_json)
    )

    file.writeSync(
        env.generate([
            {
                key: 'app_title',
                value: config.app.directory.title,
            },
            {
                key: 'insight_url',
                value: config.insight.url,
            },
        ]),
        path.join(dataDir, '.env')
    )

    const filesToCopy = [
        {
            src: path.join(
                extractedFolder,
                config.app.directory.error.voice.file
            ),
            dest: path.join(
                targetFolder,
                config.app.directory.error.voice.target
            ),
        },
        {
            src: path.resolve(ASSETS_DIST_DIR, config.module.assets.background),
            dest: path.resolve(targetFolder, config.module.assets.background),
        },
        {
            src: path.resolve(ASSETS_DIST_DIR, config.module.assets.music),
            dest: path.resolve(targetFolder, config.module.assets.music),
        },
        {
            src: path.resolve(ASSETS_DIST_DIR, config.module.operator.logos),
            dest: path.resolve(targetFolder, config.module.operator.logos),
        },
    ]

    operatorFilesToCopy.map((key) => {
        const portraitName = `${operators[key].fallback_name}_portrait.png`
        filesToCopy.push({
            src: path.join(
                sourceFolder,
                config.module.operator.operator,
                key,
                portraitName
            ),
            dest: path.join(
                targetFolder,
                config.app.directory.portraits,
                portraitName
            ),
        })
    })

    filesToCopy.forEach((item) => {
        file.symlink(item.src, item.dest)
    })

    return directoryConfig
}
