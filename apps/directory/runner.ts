import path from 'node:path'
import { DIST_DIR } from '@aklive2d/showcase'
import { build as viteBuild } from 'vite'
import { envParser, file } from '@aklive2d/libs'

const build = async (namesToBuild: string[]) => {
    if (!namesToBuild.length) {
        // skip as directory can only build
        // when all operators are built
        await viteBuild()
        const releaseDir = path.resolve(DIST_DIR)
        file.rmdir(releaseDir)
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
    await build(name as string[])
}

main()
