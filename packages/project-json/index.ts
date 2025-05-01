import path from 'node:path'
import Matcher from './libs/content_processor.ts'
import { yaml, file } from '@aklive2d/libs'
import config from '@aklive2d/config'
import operators, { OPERATOR_SOURCE_FOLDER } from '@aklive2d/operator'
import { files as backgrounds } from '@aklive2d/background'
import { mapping as musics } from '@aklive2d/music'
import { getLangs } from '@aklive2d/charword-table'
import type { ScalarTag } from 'yaml'
import type {
    Assets,
    TemplateYAML,
    ProjectJSON,
    ProjectJSONProperty,
} from './types.ts'

const DIST_DIR = path.join(import.meta.dirname, config.dir_name.dist)

export const build = (namesToBuild: string[]) => {
    const err = []
    const names = !namesToBuild.length ? Object.keys(operators) : namesToBuild
    console.log('Generating assets for', names.length, 'operators')
    const musicMapping = []
    // sort music mapping based on background file order
    for (const item of backgrounds) {
        if (musics.musicFileMapping[item]) {
            musicMapping.push(item)
        } else {
            err.push(
                `Music folder doesn't contain music for ${item} background.`
            )
        }
    }
    for (const name of names) {
        const { voiceLangs, subtitleLangs } = getLangs(name)
        load(name, {
            backgrounds,
            voiceLangs,
            subtitleLangs,
            music: musicMapping,
        })
        file.symlink(
            path.join(
                getDefaultPath(name),
                config.module.project_json.preview_jpg
            ),
            path.join(getDistDir(name), config.module.project_json.preview_jpg)
        )
    }
    return err
}

const getDistDir = (name: string) => {
    return path.join(DIST_DIR, name)
}

const getDefaultPath = (name: string) => {
    return path.join(OPERATOR_SOURCE_FOLDER, name)
}

const getPath = (name: string) => {
    // if exists, do not use the template
    const defaultPath = path.join(
        getDefaultPath(name),
        config.module.project_json.project_json
    )
    if (file.exists(defaultPath)) {
        return defaultPath
    } else {
        return path.join(
            import.meta.dirname,
            config.module.project_json.project_json
        )
    }
}

const process = ({
    name,
    data,
    template,
}: {
    name: string
    data: ProjectJSON
    template: TemplateYAML
}) => {
    return {
        ...data,
        description: template.description,
        title: operators[name].title,
        general: {
            ...data.general,
            localization: template.localization,
            properties: {
                ...getProperties(template),
            },
        },
    } as ProjectJSON
}

const getProperties = (template: TemplateYAML) => {
    const properties = template.properties
    const output = {} as {
        [key: string]: ProjectJSONProperty
    }
    for (let i = 0; i < properties.length; i++) {
        output[properties[i].key] = {
            index: i,
            order: 100 + i,
            ...properties[i].value,
        }
    }
    return output
}

const load = async (name: string, assets: Assets) => {
    // load json from file
    let data = JSON.parse(await file.read(getPath(name))) as ProjectJSON
    const matcher = new Matcher('~{', '}', operators[name], {
        ...assets,
        ...(() => {
            const output = {} as {
                [key: string]: { label: string; value: string }[]
            }
            for (const [key, value] of Object.entries(assets)) {
                output[`${key}Options`] = value.map((b) => {
                    return {
                        label: b,
                        value: b,
                    }
                })
            }
            return output
        })(),
    })
    const match = {
        identify: (value: unknown) =>
            typeof value === 'string' && value.startsWith('!match'),
        tag: '!match',
        resolve(str: string) {
            matcher.content = str
            return matcher.result
        },
    } as ScalarTag
    const template = yaml.read(
        path.resolve(
            import.meta.dirname,
            config.module.project_json.template_yaml
        ),
        [match]
    ) as TemplateYAML
    data = process({
        name,
        data,
        template,
    })
    file.writeSync(
        JSON.stringify(data, null, 2),
        path.join(getDistDir(name), config.module.project_json.project_json)
    )
}
