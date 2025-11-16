export type Codename = { 'zh-CN': string; 'en-US': string }

export type OperatorEntryType = 'operator' | 'skin'

export interface OperatorConfig {
    filename: string
    logo: string
    portrait_filename: string
    viewport_left: number // should be default to 0 in the future
    viewport_right: number
    viewport_top: number
    viewport_bottom: number
    invert_filter: boolean
    codename: Codename
    use_json: boolean // can be detected automatically
    official_id: string // reverse lookup from official_update?
    title: string
    type: OperatorEntryType
    link: string
    id: string // used in directory
    date: string
    voice_id: string | null
    color: string
    isSP: boolean // kroos_moonlit_voyage_sp
}

export type Config = {
    [name: string]: OperatorConfig
}

export type AssetsJson = {
    filename: string
    path?: string
    content?: string | Buffer<ArrayBufferLike> | Buffer
}[]

/**
 * Minimum type for character_table.json
 * Implmented for:
 *     - findLogo
 */
export type CharacterTableJson = {
    [id: string]: {
        name: string // operator chinese name
        appellation: string // operator english name
        nationId: string // class i logo classifier
        groupId: string | null // class ii logo classifier
        teamId: string | null // class iii logo classifier
    }
}

/**
 * Minimum type for skin_table.json
 * Intended for:
 *     - replacing OperatorConfig.filename
 */
export type SkinTableJsonCharSkinEntry = {
    skinId: string
    charId: string
    dynIllustId: string // when replacing filename, remove suffix `_2`
    voiceId: string | null // if null, use default voice
    displaySkin: {
        skinName: string | null // if null, not a skin
        modelName: string
        colorList: string[]
    }
}
export type SkinTableJson = {
    charSkins: {
        [id: string]: SkinTableJsonCharSkinEntry
    }
}
