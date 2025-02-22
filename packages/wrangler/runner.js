import { envParser } from '@aklive2d/libs'
import { upload, download, deploy } from './index.js'

async function main() {
    const { mode } = envParser.parse({
        mode: {
            type: 'string',
            short: 'm',
        },
    })
    switch (mode) {
        case 'upload':
            await upload()
            break
        case 'download':
            await download()
            break
        case 'deploy':
            await deploy()
            break
        default:
            throw new Error(`Unknown mode: ${mode}`)
    }
}

main()
