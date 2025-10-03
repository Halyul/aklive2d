import path from 'node:path'
import { file } from '@aklive2d/libs'
import { DIST_DIR } from '@aklive2d/showcase'
import { build as viteBuild } from 'vite'

async function main() {
    await viteBuild()
    const releaseDir = path.resolve(DIST_DIR)
    file.rmdir(releaseDir)
}

main()
