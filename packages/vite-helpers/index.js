import path from 'node:path'
import config from '@aklive2d/config'
import operators, {
    OPERATOR_SOURCE_FOLDER,
    generateAssetsJson,
} from '@aklive2d/operator'
import { DIST_DIR as ASSETS_DIST_DIR } from '@aklive2d/assets'
import { file, env } from '@aklive2d/libs'
import { files as backgroundFiles } from '@aklive2d/background'
import { mapping as musicMapping } from '@aklive2d/music'

export const copyShowcaseData = (name, { dataDir, publicAssetsDir }) => {
    file.mkdir(publicAssetsDir)
    const operatorAssetsDir = path.join(
        ASSETS_DIST_DIR,
        config.dir_name.operator,
        name
    )
    const spineFilenames = file
        .readdirSync(operatorAssetsDir)
        .filter((item) => item.startsWith('dyn_illust_'))
    const q = [
        {
            fn: file.symlink,
            source: path.resolve(ASSETS_DIST_DIR, config.dir_name.background),
            target: path.resolve(publicAssetsDir, config.dir_name.background),
        },
        {
            fn: file.symlink,
            source: path.resolve(ASSETS_DIST_DIR, config.dir_name.music),
            target: path.resolve(publicAssetsDir, config.dir_name.music),
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
                config.dir_name.operator,
                name
            ),
            target: path.resolve(publicAssetsDir),
        },
        {
            fn: file.symlink,
            filename: `${operators[name].logo}.png`,
            source: path.resolve(ASSETS_DIST_DIR, config.dir_name.logos),
            target: path.resolve(publicAssetsDir),
        },
        {
            fn: file.symlink,
            filename: config.module.charword_table.charword_table_json,
            source: path.resolve(
                ASSETS_DIST_DIR,
                config.dir_name.charword_table,
                name
            ),
            target: path.resolve(dataDir),
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
    q.map(({ fn, filename, source, target }) => {
        if (filename) {
            source = path.resolve(source, filename)
            target = path.resolve(target, filename)
        }
        fn(source, target)
    })
    const buildConfig = {
        akassets_url: config.akassets.url,
        insight_id: config.insight.id,
        link: operators[name].link,
        filename: operators[name].filename.replace(/#/g, '%23'),
        logo_filename: operators[name].logo,
        fallback_filename: operators[name].fallback_name.replace(/#/g, '%23'),
        viewport_left: operators[name].viewport_left,
        viewport_right: operators[name].viewport_right,
        viewport_top: operators[name].viewport_top,
        viewport_bottom: operators[name].viewport_bottom,
        invert_filter: operators[name].invert_filter,
        image_width: 2048,
        image_height: 2048,
        background_files: backgroundFiles,
        background_folder: config.dir_name.background,
        voice_folders: config.dir_name.voice,
        music_folder: config.dir_name.music,
        music_mapping: musicMapping.musicFileMapping,
        use_json: operators[name].use_json,
    }
    file.writeSync(
        JSON.stringify(buildConfig),
        path.join(path.resolve(dataDir), config.dir_name.config_json)
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
}

export const copyProjectJSON = (name, { releaseDir }) => {
    file.cpSync(
        path.resolve(ASSETS_DIST_DIR, config.dir_name.project_json, name),
        path.resolve(releaseDir),
        {
            dereference: true,
        }
    )
}

export const copyDirectoryData = async ({ dataDir, publicDir }) => {
    file.mkdir(publicDir)
    const extractedFolder = path.join(
        OPERATOR_SOURCE_FOLDER,
        config.module.operator.directory_assets
    )
    const targetFolder = path.join(publicDir, config.directory.assets_dir)
    const sourceFolder = path.join(ASSETS_DIST_DIR)
    const filesToCopy = Object.keys(operators)
    const operatorConfig = Object.values(
        Object.values(operators).reduce((acc, cur) => {
            const date = cur.date
            if (acc[date]) {
                acc[date].push(cur)
            } else {
                acc[date] = [cur]
            }

            cur.workshopId = null
            try {
                cur.workshopId = JSON.parse(
                    file.readSync(
                        path.join(
                            ASSETS_DIST_DIR,
                            config.dir_name.project_json,
                            cur.link,
                            config.module.project_json.project_json
                        )
                    )
                ).workshopid
            } catch (e) {
                console.log(`No workshop id for ${cur.link}!`, e)
            }

            return acc
        }, {})
    ).sort((a, b) => Date.parse(b[0].date) - Date.parse(a[0].date))
    await Promise.all(
        config.directory.error.files.map(async (key) => {
            await generateAssetsJson(key.key, extractedFolder, targetFolder, {
                useSymLink: false,
            })
        })
    )

    const directoryConfig = {
        akassets_url: config.akassets.url,
        insight_id: config.insight.id,
        app_voice_url: config.directory.voice,
        voice_folders: config.dir_name.voice,
        directory_folder: config.directory.assets_dir,
        default_background: config.module.background.operator_bg_png,
        background_files: backgroundFiles,
        background_folder: config.dir_name.background,
        available_operators: Object.keys(operators),
        error_files: config.directory.error,
        music_folder: config.dir_name.music,
        music_mapping: musicMapping.musicFileMapping,
        operators: operatorConfig,
    }
    file.writeSync(
        JSON.stringify(directoryConfig),
        path.join(dataDir, config.dir_name.config_json)
    )

    file.writeSync(
        env.generate([
            {
                key: 'app_title',
                value: config.directory.title,
            },
            {
                key: 'insight_url',
                value: config.insight.url,
            },
        ]),
        path.join(dataDir, '.env')
    )

    filesToCopy.map((key) => {
        const portraitName = `${operators[key].fallback_name}_portrait.png`
        file.cpSync(
            path.join(
                sourceFolder,
                config.dir_name.charword_table,
                key,
                config.module.charword_table.charword_table_json
            ),
            path.join(targetFolder, `voice_${key}.json`)
        )
        file.cpSync(
            path.join(
                sourceFolder,
                config.dir_name.operator,
                key,
                portraitName
            ),
            path.join(targetFolder, portraitName)
        )
    })

    file.cpSync(
        path.join(extractedFolder, config.directory.error.voice.file),
        path.join(targetFolder, config.directory.error.voice.target)
    )
}
