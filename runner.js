import assert from 'assert'
import path from 'path'
import { fileURLToPath } from 'url'
import getConfig from './libs/config.js'
import ProjectJson from './libs/project_json.js'
import EnvGenerator from './libs/env_generator.js'
import { write, rmdir, copy } from './libs/file.js'
import AssetsProcessor from './libs/assets_processor.js'
import init from './libs/initializer.js'
import directory from './libs/directory.js'
import { buildAll, runDev, runBuild } from './libs/exec.js'
import { appendReadme } from './libs/append.js'
import Background from './libs/background.js'

async function main() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const config = getConfig(__dirname)

    const op = process.argv[2]
    const OPERATOR_NAME = process.argv[3];

    const background = new Background(config, __dirname)
    await background.process()

    /**
     * Skip all, no need for OPERATOR_NAME
     * build-all: build all assets
     * directory: build directory.json
     */
    switch (op) {
        case 'build-all':
            buildAll(config)
            process.exit(0)
        case 'directory':
            directory(config, __dirname)
            process.exit(0)
        default:
            break
    }

    assert(OPERATOR_NAME !== undefined, 'Please set the operator name.')

    const OPERATOR_SOURCE_FOLDER = path.join(__dirname, config.folder.operator)
    const OPERATOR_RELEASE_FOLDER = path.join(__dirname, config.folder.release, OPERATOR_NAME)
    const SHOWCASE_PUBLIC_FOLDER = path.join(__dirname, "public")
    const SHOWCASE_PUBLIC_ASSSETS_FOLDER = path.join(SHOWCASE_PUBLIC_FOLDER, "assets")
    const EXTRACTED_FOLDER = path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, 'extracted')
    const OPERATOR_SHARE_FOLDER = path.join(OPERATOR_SOURCE_FOLDER, '_share')

    /**
     * Skip assets generation part
     * init: init folder and config for an operator
     * readme: append a new line to README.md
     */
    switch (op) {
        case 'init':
            init(OPERATOR_NAME, __dirname, EXTRACTED_FOLDER)
            process.exit(0)
        case 'readme':
            appendReadme(config, OPERATOR_NAME, __dirname)
            process.exit(0)
        default:
            break
    }

    rmdir(OPERATOR_RELEASE_FOLDER)

    const projectJson = new ProjectJson(config, OPERATOR_NAME, __dirname, OPERATOR_SHARE_FOLDER)
    projectJson.load().then((content) => {
        write(JSON.stringify(content, null, 2), path.join(OPERATOR_RELEASE_FOLDER, 'project.json'))
    })

    const assetsProcessor = new AssetsProcessor(config, OPERATOR_NAME, __dirname)
    assetsProcessor.process(SHOWCASE_PUBLIC_ASSSETS_FOLDER, EXTRACTED_FOLDER).then((content) => {
        write(JSON.stringify(content.assetsJson, null), path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, `${config.operators[OPERATOR_NAME].filename}.json`))
    })

    const envGenerator = new EnvGenerator(config, OPERATOR_NAME, __dirname)
    envGenerator.generate().then((content) => {
        write(content, path.join(__dirname, '.env'))
    })

    const filesToCopy = [
        ...background.getFilesToCopy(SHOWCASE_PUBLIC_ASSSETS_FOLDER),
        {
            filename: 'preview.jpg',
            source: path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME),
            target: path.join(OPERATOR_RELEASE_FOLDER)
        },
        {
            filename: 'operator_bg.png',
            source: path.join(OPERATOR_SOURCE_FOLDER, config.folder.background),
            target: path.join(SHOWCASE_PUBLIC_FOLDER)
        },
        {
            filename: `${config.operators[OPERATOR_NAME].logo}.png`,
            source: path.join(OPERATOR_SHARE_FOLDER, 'logo'),
            target: path.join(SHOWCASE_PUBLIC_ASSSETS_FOLDER)
        },
        {
            filename: `${config.operators[OPERATOR_NAME].fallback_name}.png`,
            source: path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME),
            target: path.join(SHOWCASE_PUBLIC_ASSSETS_FOLDER)
        },
    ]
    filesToCopy.forEach(async (file) => {
        await copy(path.join(file.source, file.filename), path.join(file.target, file.filename))
    })

    /**
     * dev: run dev server
     * build: build assets
     */
    switch (op) {
        case 'dev':
            runDev(__dirname)
            break
        case 'build':
            await runBuild(__dirname)
        case 'generate':
        default:
            rmdir(SHOWCASE_PUBLIC_FOLDER)
            break
    }
}

main();