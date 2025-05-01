import path from 'node:path'
import { yaml } from '@aklive2d/libs'
import type { Config } from './types'

const config: Config = yaml.read(
    path.resolve(import.meta.dirname, 'config.yaml')
)

export default config
