import path from 'path'
import { read } from './yaml.js'

export default function (dirname) {
    return {
        basedir: dirname,
        ...read(path.join(dirname, 'config.yaml'))
    }
}