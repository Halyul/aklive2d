import path from 'node:path'
import config from '@aklive2d/config'
import { file } from '@aklive2d/libs'
import { DIST_DIR } from '../index.ts'

export default async (packageDir: string) => {
    const copyQueue = [
        {
            fn: file.symlink,
            source: path.resolve(
                packageDir,
                'background',
                config.dir_name.dist
            ),
            target: path.resolve(DIST_DIR, config.module.assets.background),
        },
        {
            fn: file.symlink,
            source: path.resolve(
                packageDir,
                'charword-table',
                config.dir_name.dist
            ),
            target: path.resolve(DIST_DIR, config.module.assets.charword_table),
        },
        {
            fn: file.symlink,
            source: path.resolve(packageDir, 'music', config.dir_name.data),
            target: path.resolve(DIST_DIR, config.module.assets.music),
        },
        {
            fn: file.symlinkAll,
            source: path.resolve(packageDir, 'operator', config.dir_name.dist),
            target: path.resolve(DIST_DIR),
        },
        {
            fn: file.symlink,
            source: path.resolve(
                packageDir,
                'project-json',
                config.dir_name.dist
            ),
            target: path.resolve(DIST_DIR, config.module.assets.project_json),
        },
    ]
    copyQueue.map(({ fn, source, target }) => {
        fn(source, target)
    })
}
