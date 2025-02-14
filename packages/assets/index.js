import path from 'node:path'
import config from '@aklive2d/config'

export const DIST_DIR = path.resolve(import.meta.dirname, config.dir_name.dist)
