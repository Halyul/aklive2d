export type Codename = { 'zh-CN': string; 'en-US': string }

export type OperatorEntryType = 'operator' | 'skin'

export interface OperatorConfig {
    filename: string
    logo: string
    fallback_name: string
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
}

export type Config = {
    [name: string]: OperatorConfig
}

type FileIDPathID = {
    m_FileID: number
    m_PathID: number
}

export type PortraitHub = {
    m_GameObject: FileIDPathID
    m_Enabled: number
    m_Script: FileIDPathID
    m_Name: string
    _sprites: {
        name: string
        atlas: number
    }[]
    _atlases: string[]
    _inputSpriteDir: string
    _outputAtlasDir: string
    _rootAtlasName: string
    _spriteSize: {
        width: number
        height: number
    }
    _cntPerAtlas: number
    _maxAtlasSize: number
}

type SignedItem = {
    name: string
    guid: string
    md5: string
}

export type PortraitJson = {
    m_GameObject: FileIDPathID
    m_Enabled: number
    m_Script: FileIDPathID
    m_Name: string
    _sprites: {
        name: string
        guid: string
        atlas: number
        rect: {
            x: number
            y: number
            w: number
            h: number
        }
        rotate: number
    }[]
    _atlas: {
        index: number
        texture: FileIDPathID
        alpha: FileIDPathID
        size: number
    }
    _index: number
    _sign: {
        m_sprites: SignedItem[]
        m_atlases: SignedItem[]
        m_alphas: SignedItem[]
    }
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
