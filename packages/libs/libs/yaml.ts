import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import type { Tags, ScalarTag, SchemaOptions, CollectionTag } from 'yaml'

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
    const file = fs.readFileSync(file_dir, 'utf8')
    return parse(file, {
        customTags: [include, ...customTags],
    } as SchemaOptions)
}
