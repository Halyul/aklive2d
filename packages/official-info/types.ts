export type OfficialOperatorInfo = {
    cid: string
    charName: string
    suitName: string
    codename: string
    type: number
    displayTime: string
    portraitSrc: string
}

export type OfficialDataArray = [
    '$',
    string,
    null,
    {
        initialData: OfficialOperatorInfo[]
    },
]

type UnrelatedDataArray = ['$', string, null, unknown]

export type OfficialArray = [OfficialDataArray, UnrelatedDataArray]

export type OfficialInfo = {
    length: number
    dates: string[]
    info: {
        [date: string]: OfficialInfoOperatorConfig[]
    }
}

export interface OfficialInfoOperatorConfig {
    codename: {
        'zh-CN': string
        'en-US': string
    }
    type: 'operator' | 'skin'
    link: string
    id: string
}

export interface OperatorConfig extends OfficialInfoOperatorConfig {
    date: string
}

export type OfficialInfoMapping = {
    [id: string]: OperatorConfig
}
