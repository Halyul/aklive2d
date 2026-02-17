export type Region = 'zh_CN' | 'en_US' | 'ja_JP' | 'ko_KR'

interface CharWordBase {
    wordKey: string
    charId: string
    voiceId: string
    voiceText: string
}

interface CharWord extends CharWordBase {
    charWordId: string
    voiceTitle: string
    voiceIndex: number
    voiceType: string
    unlockType: string
    unlockParam: unknown
    lockDescription: string
    placeType: string
    voiceAsset: string
}

type VoiceLangInfo = {
    wordkey: string
    voiceLangType: string
    cvName: string[]
    voicePath: string | null
}

type CharVoiceLangDict = {
    wordkeys: string[]
    charId: string
    dict: Record<string, VoiceLangInfo>
}

type VoiceLangType = {
    name: string
    groupType: string
}

type VoiceLangGroupType = {
    name: string
    members: string[]
}

type TimestampCharSet = {
    timestamp: number
    charSet: string[]
}

type TimeData = {
    timeType: string
    interval: {
        startTs: number
        endTs: number
    }
}

type FesVoiceData = {
    showType: string
    timeData: TimeData[]
}

type FesVoiceWeight = {
    showType: string
    weight: number
    priority: number
}

type ExtraVoiceConfig = {
    voiceId: string
    validVoiceLang: string[]
}

export type CharwordTableJson = {
    charWords: Record<string, CharWord>
    charExtraWords: Record<string, CharWordBase>
    voiceLangDict: Record<string, CharVoiceLangDict>
    defaultLangType: string
    newTagList: string[]
    voiceLangTypeDict: Record<string, VoiceLangType>
    voiceLangGroupTypeDict: Record<string, VoiceLangGroupType>
    charDefaultTypeDict: Record<string, string>
    startTimeWithTypeDict: Record<string, TimestampCharSet[]>
    displayGroupTypeList: string[]
    displayTypeList: string[]
    playVoiceRange: string
    fesVoiceData: Record<string, FesVoiceData>
    fesVoiceWeight: Record<string, FesVoiceWeight>
    extraVoiceConfigData: Record<string, ExtraVoiceConfig>
}

export type OperatorCharwordTable = {
    availability: {
        [languageCode: string]: string[]
    }
    voiceLangs: {
        [languageCode: string]: {
            [voiceLangType: string]: string[]
        }
    }
    subtitleLangs: {
        [languageCode: string]: {
            [voiceKey: 'default' | string]: {
                [voiceId: string]: {
                    title: string
                    text: string
                }
            }
        }
    }
}

export type VoiceRegionObject = {
    [region in Region]: {
        [wordkey: string]: {
            [voiceId: string]: {
                title: string
                text: string
            }
        }
    }
}

export type InfoRegionObject = {
    [region in Region]: {
        [wordkey: string]: {
            [voiceLangType: string]: string[]
        }
    }
}

export type CharwordTable = {
    [name: string]: {
        alternativeId: string
        voice: VoiceRegionObject
        info: InfoRegionObject
        infile: boolean
        ref: boolean
    }
}
