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

export type OfficialInfoMapping = {
    [id: string]: OfficialInfoOperatorConfigV2
}

export type OfficialInfoV2 = {
    length: number
    dates: string[]
    info: OfficialInfoOperatorConfigV2[]
}

export type OfficialInfoOperatorConfigV2 = {
    operatorName: string
    skinName: {
        'zh-CN': string
        'en-US': string
    }
    type: 'operator' | 'skin'
    link: string
    id: number
    date: string
}
