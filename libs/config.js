import path from 'path'
import { read } from './yaml.js'

export default function () {
    return read(path.join(__dirname, 'config.yaml'))
}