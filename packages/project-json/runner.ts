import { envParser, error } from '@aklive2d/libs'
import { build } from './index.js'

async function main() {
    let err = []
    const { mode, name } = envParser.parse({
        mode: {
            type: 'string',
            short: 'm',
        },
        name: {
            type: 'string',
            short: 'n',
            multiple: true,
            default: [],
        },
    }) as { mode: string; name: string[] }
    switch (mode) {
        case 'build':
            err = build(name)
            break
        default:
            throw new Error(`Unknown mode: ${mode}`)
    }
    error.handle(err)
}

main()
