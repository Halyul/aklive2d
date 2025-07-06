export type OfficialDataOperatorObj = {
    cid: string
    name: string
    content: {
        type: number
        charName: string
        codename: string
        suitName: string
        displayTime: string
    }
}

type OfficialDataObj = {
    list: Array<OfficialDataOperatorObj>
    total: number
    page: number
    pageSize: number
    end: boolean
}

export type OfficialDataResp = {
    code: number
    data: OfficialDataObj
}

export type OfficialInfoMapping = {
    [id: string]: OfficialInfoOperatorConfigV2
}

export type OfficialInfoV2 = {
    length: number
    dates: Set<string>
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
