import path from 'path'
import { read } from './yaml.js'

export default function () {
    return {
        basedir: __dirname,
        ...read(path.join(__dirname, 'config.yaml'))
    }
}