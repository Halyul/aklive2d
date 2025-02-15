import { envParser } from '@aklive2d/libs'

async function main() {
    const { mode } = envParser.parse({
        mode: {
            type: 'string',
            short: 'm',
        },
    })
    switch (mode) {
        case 'upload':
            break
        case 'download':
            break
        case 'deploy':
            break
        default:
            throw new Error(`Unknown mode: ${mode}`)
    }
}

main()
