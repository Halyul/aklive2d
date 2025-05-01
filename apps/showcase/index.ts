import path from 'node:path'
import config from '@aklive2d/config'

export const DATA_DIR = path.resolve(import.meta.dirname, config.dir_name.data)
export const PUBLIC_DIR = path.resolve(DATA_DIR, config.app.showcase.public)
export const PUBLIC_ASSETS_DIR = path.resolve(
    PUBLIC_DIR,
    config.app.showcase.assets
)
export const OUT_DIR = path.resolve(import.meta.dirname, config.dir_name.dist)
export const DIST_DIR = path.resolve(
    import.meta.dirname,
    '..',
    '..',
    config.app.showcase.release
)
