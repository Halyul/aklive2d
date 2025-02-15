import path from 'node:path'
import { file, envParser } from '@aklive2d/libs'
import config from '@aklive2d/config'
import { DIST_DIR } from './index.js'

const PACKAGES_DIR = path.resolve(import.meta.dirname, '..')

const build = async () => {
    const copyQueue = [
        {
            fn: file.symlink,
            source: path.resolve(
                PACKAGES_DIR,
                'background',
                config.dir_name.dist
            ),
            target: path.resolve(DIST_DIR, config.dir_name.background),
        },
        {
            fn: file.symlink,
            source: path.resolve(
                PACKAGES_DIR,
                'charword-table',
                config.dir_name.dist
            ),
            target: path.resolve(DIST_DIR, config.dir_name.charword_table),
        },
        {
            fn: file.symlink,
            source: path.resolve(PACKAGES_DIR, 'music', config.dir_name.data),
            target: path.resolve(DIST_DIR, config.dir_name.music),
        },
        {
            fn: file.symlinkAll,
            source: path.resolve(
                PACKAGES_DIR,
                'operator',
                config.dir_name.dist
            ),
            target: path.resolve(DIST_DIR),
        },
        {
            fn: file.symlink,
            source: path.resolve(
                PACKAGES_DIR,
                'project-json',
                config.dir_name.dist
            ),
            target: path.resolve(DIST_DIR, config.dir_name.project_json),
        },
    ]
    copyQueue.map(({ fn, source, target }) => {
        fn(source, target)
    })
}

async function main() {
    const { mode } = envParser.parse({
        mode: {
            type: 'string',
            short: 'm',
        },
    })
    switch (mode) {
        case 'build':
            await build()
            break
        case 'fetch':
            break
        default:
            throw new Error(`Unknown mode: ${mode}`)
    }
}

main()
