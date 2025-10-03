import path from 'node:path'
import { envParser, file } from '@aklive2d/libs'
import operators from '@aklive2d/operator'
import { copyProjectJSON, copyShowcaseData } from '@aklive2d/vite-helpers'
import { build as viteBuild } from 'vite'
import * as dirs from './index.js'

const build = async (namesToBuild: string[], mode: string) => {
    const names = !namesToBuild.length ? Object.keys(operators) : namesToBuild
    console.log('Generating assets for', names.length, 'operators')
    for (const name of names) {
        copyShowcaseData(name, {
            dataDir: dirs.DATA_DIR,
            publicAssetsDir: dirs.PUBLIC_ASSETS_DIR,
            mode,
        })
        await viteBuild()
        const releaseDir = path.join(dirs.DIST_DIR, name)
        file.mv(dirs.OUT_DIR, releaseDir)
        file.rm(dirs.DATA_DIR)
        if (mode !== 'build:directory') {
            copyProjectJSON(name, {
                releaseDir,
            })
        }
    }
}

async function main() {
    const { name, mode } = envParser.parse({
        name: {
            type: 'string',
            short: 'n',
            multiple: true,
            default: [],
        },
        mode: {
            type: 'string',
            short: 'm',
        },
    })
    await build(name as string[], mode as string)
}

main()
