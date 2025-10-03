import path from 'node:path'
import config from '@aklive2d/config'
import { envParser } from '@aklive2d/libs'
import build from './libs/build.ts'
import download from './libs/download.ts'

const packageDir = path.resolve(import.meta.dirname, '..')
const dataDir = path.resolve(import.meta.dirname, config.dir_name.data)

async function main() {
    const { mode } = envParser.parse({
        mode: {
            type: 'string',
            short: 'm',
        },
    })
    switch (mode) {
        case 'build':
            await build(packageDir)
            break
        case 'download':
            await download(dataDir)
            break
        default:
            throw new Error(`Unknown mode: ${mode}`)
    }
}

main()
