import assert from 'assert'
import getConfig from './lib/config.js'
import ProjectJson from './lib/project_json.js'
import EnvGenerator from './lib/env_generator.js'
import { write, rmdir, copy } from './lib/file.js'
import AssetsProcessor from './lib/assets_processor.js'
import path from 'path'
import { fileURLToPath } from 'url'
import init from './lib/initializer.js'
import directory from './lib/directory.js'
import exec from './lib/exec.js'

let __dirname
__dirname = __dirname || path.dirname(fileURLToPath(import.meta.url))
const config = getConfig(__dirname)

let mode = null
const OPERATOR_NAME = process.env.O;
const op = process.argv[2]

if (process.argv[1].endsWith('vite.js')) {
    mode = "VITE"
} else {
    mode = "NODE"
}

switch (op) {
    case '-a':
        exec(config)
        process.exit(0)
    case '-d':
        directory(config, __dirname)
        process.exit(0)
    default:
        break
}

assert(OPERATOR_NAME !== undefined, 'Please set the environment variable O to the operator name.')

const OPERATOR_SOURCE_FOLDER = path.join(__dirname, config.folder.operator)
const OPERATOR_RELEASE_FOLDER = path.join(__dirname, config.folder.release, OPERATOR_NAME)
const SHOWCASE_PUBLIC_FOLDER = path.join(__dirname, "public")
const SHOWCASE_PUBLIC_ASSSETS_FOLDER = path.join(SHOWCASE_PUBLIC_FOLDER, "assets")
const EXTRACTED_FOLDER = path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, 'extracted')
const OPERATOR_SHARE_FOLDER = path.join(OPERATOR_SOURCE_FOLDER, '_share')
rmdir(SHOWCASE_PUBLIC_FOLDER)
if (mode === 'NODE') {

    switch (op) {
        case '-i':
            init(OPERATOR_NAME, __dirname, EXTRACTED_FOLDER)
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
        const envGenerator = new EnvGenerator(config, OPERATOR_NAME)
        envGenerator.generate(content.dimensions).then((value) => {
            write(value, path.join(__dirname, '.env'))
        })
        write(JSON.stringify(content.assetsJson, null), path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME, `${config.operators[OPERATOR_NAME].filename}.json`))
    })
}
const filesToCopy = [
    {
        filename: 'preview.jpg',
        source: path.join(OPERATOR_SOURCE_FOLDER, OPERATOR_NAME),
        target: path.join(OPERATOR_RELEASE_FOLDER)
    },
    {
        filename: 'operator_bg.png',
        source: OPERATOR_SHARE_FOLDER,
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
filesToCopy.forEach((file) => {
    copy(path.join(file.source, file.filename), path.join(file.target, file.filename))
})

export default {
    OPERATOR_NAME,
    config,
}