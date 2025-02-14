import path from 'node:path'
import { build as viteBuild } from 'vite'
import operators from '@aklive2d/operator'
import { envParser, file } from '@aklive2d/libs'
import { copyShowcaseData, copyProjectJSON } from '@aklive2d/vite-helpers'
import * as dirs from './index.js'

const build = async (namesToBuild) => {
    const names = !namesToBuild.length ? Object.keys(operators) : namesToBuild
    console.log('Generating assets for', names.length, 'operators')
    for (const name of names) {
        copyShowcaseData(name, {
            dataDir: dirs.DATA_DIR,
            publicAssetsDir: dirs.PUBLIC_ASSETS_DIR,
        })
        await viteBuild()
        const releaseDir = path.join(dirs.DIST_DIR, name)
        file.mv(dirs.OUT_DIR, releaseDir)
        file.rm(dirs.DATA_DIR)
        copyProjectJSON(name, {
            releaseDir,
        })
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
