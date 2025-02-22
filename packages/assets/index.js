import path from 'node:path'
import config from '@aklive2d/config'
import { yaml } from '@aklive2d/libs'

export const DIST_DIR = path.resolve(import.meta.dirname, config.dir_name.dist)
export const CONFIG_PATH = path.resolve(
    import.meta.dirname,
    config.module.assets.config_yaml
)
const selfConfig = yaml.read(CONFIG_PATH)

export default selfConfig
