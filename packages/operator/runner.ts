import { envParser } from '@aklive2d/libs'
import { build } from './libs/builder.ts'
import { init } from './libs/initer.ts'
import { update } from './libs/updater.ts'

type Args = {
    mode: string
    name: string[]
    id: string
}

async function main() {
    const { mode, name, id } = envParser.parse({
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
        id: {
            type: 'string',
        },
    }) as Args
    switch (mode) {
        case 'build':
            await build(name)
            break
        case 'update':
            await update()
            break
        case 'init':
            if (!name.length) {
                throw new Error('Please set the operator name.')
            }
            if (!id) {
                throw new Error('Please set the operator id.')
            }
            init(name[0], id)
            break
        default:
            throw new Error(`Unknown mode: ${mode}`)
    }
}

main()
