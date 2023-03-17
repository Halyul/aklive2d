import path from 'path'
import { parse } from 'yaml'
import fs from 'fs'

export function read(file_dir, customTags = []) {
    const include = {
        identify: value => value.startsWith('!include'),
        tag: '!include',
        resolve(str) {
            const dir = path.resolve(path.dirname(file_dir), str)
            const data = read(dir)
            return data
        }
    }
    const file = fs.readFileSync(file_dir, 'utf8')
    return parse(file, {
        customTags: [include, ...customTags],
    })
}