import fs from 'node:fs'
import path from 'node:path'
import type { CollectionTag, ScalarTag, SchemaOptions } from 'yaml'
import { parse } from 'yaml'

export function read(
    file_dir: string,
    customTags: ScalarTag[] | CollectionTag[] = []
) {
    const include: ScalarTag = {
        identify: (value: unknown) =>
            typeof value === 'string' && value.startsWith('!include'),
        tag: '!include',
        resolve(str: string) {
            const dir = path.resolve(path.dirname(file_dir), str)
            const data = read(dir)
            return data
        },
    }
    const file = fs.readFileSync(file_dir, { encoding: 'utf8' })
    return parse(file, {
        customTags: [include, ...customTags],
    } as SchemaOptions)
}
