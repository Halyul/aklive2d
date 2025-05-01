export type Codename = { 'zh-CN': string; 'en-US': string }

export interface OperatorConfig {
    filename: string
    logo: string
    fallback_name: string
    viewport_left: number
    viewport_right: number
    viewport_top: number
    viewport_bottom: number
    invert_filter: boolean
    codename: Codename
    use_json: boolean
    official_id: string
    title: string
    type: 'operator' | 'skin'
    link: string
    id: string
    date: string
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
