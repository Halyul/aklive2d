import path from 'node:path'
import { yaml } from '@aklive2d/libs'

export default yaml.read(path.resolve(import.meta.dirname, 'config.yaml'))
