import path from 'path'
import { readSync, writeSync } from './file.js'

export function read (dir) {
    return readSync(path.join(dir, 'Version'))
}

export function increase(dir) {
    // release version will be lagged by 0.0.1
    const version = read(dir)
    const [major, minor, patch] = version.split('.')
    const newVersion = `${major}.${minor}.${+patch + 1}`
    writeSync(newVersion, path.join(dir, 'Version'))
    return newVersion
}
