import { build as viteBuild } from 'vite'
import { envParser } from '@aklive2d/libs'

const build = async (namesToBuild) => {
    if (!namesToBuild.length) {
        // skip as directory can only build
        // when all operators are built
        await viteBuild()
    }
}

async function main() {
    const { name } = envParser.parse({
        name: {
            type: 'string',
            short: 'n',
            multiple: true,
            default: [],
        },
    })
    await build(name)
}

main()
