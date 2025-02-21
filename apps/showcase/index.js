import path from 'node:path'
import config from '@aklive2d/config'

export const DATA_DIR = path.resolve(import.meta.dirname, config.dir_name.data)
export const PUBLIC_DIR = path.resolve(DATA_DIR, config.dir_name.public)
export const PUBLIC_ASSETS_DIR = path.resolve(
    PUBLIC_DIR,
    config.dir_name.assets
)
export const OUT_DIR = path.resolve(import.meta.dirname, config.dir_name.dist)
export const DIST_DIR = path.resolve(
    import.meta.dirname,
    '..',
    '..',
    config.dir_name.dist
)
