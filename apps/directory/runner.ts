import path from 'node:path'
import { DIST_DIR } from '@aklive2d/showcase'
import { build as viteBuild } from 'vite'
import { file } from '@aklive2d/libs'

async function main() {
    await viteBuild()
    const releaseDir = path.resolve(DIST_DIR)
    file.rmdir(releaseDir)
}

main()
