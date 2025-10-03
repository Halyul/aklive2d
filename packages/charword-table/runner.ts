import { envParser, error } from '@aklive2d/libs'
import { build, update } from './index.ts'

async function main() {
    let err: string[] = []
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
    })
    switch (mode) {
        case 'build':
            err = await build(name as string[])
            break
        case 'update':
            await update()
            break
        default:
            throw new Error(`Unknown mode: ${mode}`)
    }
    error.handle(err)
}

main()
