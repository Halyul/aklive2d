export type Assets = {
    backgrounds: string[]
    voiceLangs: string[]
    subtitleLangs: string[]
    music: string[]
}

export interface Property {
    text: string
    type?: 'bool' | 'file' | 'slider' | 'combo' | 'textinput' | 'color'
    value?: boolean | string
    condition?: string
    fraction?: boolean
    max?: number
    min?: number
    step?: number
    precision?: number
    options?: string[]
    fileType?: 'video'
}

export interface ProjectJSONProperty extends Property {
    index?: number
    order: number
}

interface Template {
    description: string
    localization: {
        'en-us': Record<string, string>
        'zh-chs': Record<string, string>
    }
}

export interface TemplateYAML extends Template {
    properties: {
        key: string
        value: Property
    }[]
}

interface TemplateJSON extends Template {
    properties: {
        [key: string]: ProjectJSONProperty
    }
}

export interface ProjectJSONBase {
    contentrating: string
    description: string
    file: string
    preview: string
    ratingsex: string
    ratingviolence: string
    snapshotformat: number
    snapshotoverlay: string
    tags: string[]
    title: string
    type: string
    version: number
    workshopid: string
}

export interface ProjectJSON extends ProjectJSONBase {
    general: TemplateJSON
}
