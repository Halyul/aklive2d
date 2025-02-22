import { envParser } from '@aklive2d/libs'
import { update } from './index.js'

async function main() {
    const { mode } = envParser.parse({
        mode: {
            type: 'string',
            short: 'm',
        },
    })
    switch (mode) {
        case 'update':
            await update()
            break
        default:
            throw new Error(`Unknown mode: ${mode}`)
    }
}

main()
