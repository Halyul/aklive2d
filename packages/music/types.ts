export type MusicMapping = {
    musicFiles: MusicFiles
    musicFileMapping: MusicFileMapping
}

export type MusicItem = {
    id?: string
    intro: string | null
    loop: string | null
}

export type MusicTable = MusicItem[]

export type MusicFileMapping = Record<string, MusicItem>

export type MusicFile = {
    filename: string
    source: string
}

export type MusicFiles = MusicFile[]

export type DisplayMetaTable = {
    playerAvatarData: {
        defaultAvatarId: string
        avatarList: {
            avatarId: string
            avatarType: string
            avatarIdSort: number
            avatarIdDesc: string
            avatarItemName: string
            avatarItemDesc: string
            avatarItemUsage: string
            obtainApproach: string
            dynAvatarId: null | unknown
        }[]
        avatarTypeData: {
            [key: string]: {
                avatarType: string
                typeName: string
                sortId: number
                avatarIdList: string[]
            }
        }
    }
    homeBackgroundData: {
        defaultBackgroundId: string
        defaultThemeId: string
        homeBgDataList: {
            bgId: string
            bgSortId: number
            bgStartTime: number
            bgName: string
            multiFormList: {
                multiFormBgId: string
                sortId: number
                bgMusicId: string
            }[]
            bgDes: string
            bgUsage: string
            obtainApproach: string
            unlockDesList: string[]
        }[]
        themeList: {
            id: string
            type: string
            sortId: number
            startTime: number
            tmName: string
            tmDes: string
            tmUsage: string
            obtainApproach: string
            unlockDesList: string[]
            isLimitObtain: boolean
            hideWhenLimit: boolean
            rarity: string
        }[]
        backgroundLimitData: {
            [key: string]: {
                bgId: string
                limitInfos: {
                    limitInfoId: string
                    startTime: Date
                    endTime: Date
                    invalidObtainDesc: string
                    displayAfterEndTime: boolean
                }[]
            }
        }
        themeLimitData: {
            [key: string]: {
                id: string
                limitInfos: {
                    startTime: Date
                    endTime: Date
                    invalidObtainDesc: string
                }[]
            }
        }
        defaultBgMusicId: string
        themeStartTime: Date
    }
    nameCardV2Data: {
        fixedModuleData: {
            [key: string]: {
                id: string
                type: string
            }
        }
        removableModuleData: {
            [key: string]: {
                sortId: number
                subType: string
                name: string
                id: string
                type: string
            }
        }
        skinData: {
            [key: string]: {
                id: string
                name: string
                type: string
                sortId: number
                isSpTheme: boolean
                defaultShowDetail: boolean
                themeName: string
                themeEnName: string
                skinStartTime: number
                skinDesc: string
                usageDesc: string
                skinApproach: string
                unlockConditionCnt: number
                unlockDescList: unknown[]
                fixedModuleList: string[]
                rarity: string
                skinTmplCnt: number
                canChangeTmpl: boolean
                isTimeLimit: boolean
                timeLimitInfoList: unknown[]
            }
        }
        consts: {
            defaultNameCardSkinId: string
            canUidHide: boolean
            removableModuleMaxCount: number
        }
    }
    mailArchiveData: {
        mailArchiveInfoDict: {
            [key: string]: {
                id: string
                type: string
                sortId: number
                displayReceiveTs: number
                year: number
                dateDelta: number
                senderId: string
                title: string
                content: string
                rewardList: {
                    id: string
                    count: number
                    type: string
                }[]
            }
        }
        constData: {
            funcOpenTs: number
        }
    }
    mailSenderData: {
        senderDict: {
            [key: string]: {
                senderId: string
                senderName: string
                avatarId: string
            }
        }
    }
    emoticonData: {
        emojiDataDict: {
            [key: string]: {
                id: string
                type: string
                sortId: number
                picId: string
                desc: string
            }
        }
        emoticonThemeDataDict: { [key: string]: string[] }
    }
    storyVariantData: {
        [key: string]: {
            plotTaskId: string
            spStoryId: string
            storyId: string
            priority: number
            startTime: number
            endTime: number
            template: string
            param: string[]
        }
    }
}

export type AudioDataTable = {
    bgmBanks: {
        intro: string
        loop: string
        volume: number
        crossfade: number
        delay: number
        fadeStyleId: null | string
        name: string
    }[]
    soundFXBanks: {
        sounds: {
            asset: string
            weight: number
            important: boolean
            is2D: boolean
            delay: number
            minPitch: number
            maxPitch: number
            minVolume: number
            maxVolume: number
            ignoreTimeScale: boolean
        }[]
        maxSoundAllowed: number
        popOldest: boolean
        customMixerGroup: string
        loop: boolean
        name: string
        mixerDesc: null | string
    }[]
    soundFXCtrlBanks: {
        targetBank: string
        ctrlStop: boolean
        ctrlStopFadetime: number
        name: string
    }[]
    snapshotBanks: {
        targetSnapshot: string
        hookSoundFxBank: string
        delay: number
        duration: number
        name: string
    }[]
    battleVoice: {
        crossfade: number
        minTimeDeltaForEnemyEncounter: number
        minSpCostForImportantPassiveSkill: number
        voiceTypeOptions: {
            voiceType: string
            priority: number
            overlapIfSamePriority: boolean
            cooldown: number
            delay: number
        }[]
    }
    musics: {
        id: string
        name: string
        bank: string
    }[]
    duckings: {
        bank: string
        volume: number
        fadeTime: number
        delay: number
        fadeStyleId: null | string
    }[]
    fadeStyles: {
        styleName: string
        fadeinTime: number
        fadeoutTime: number
        fadeinType: string
        fadeoutType: string
    }[]
    soundFxVoiceLang: {
        [key: string]: {
            [key: string]: {
                JP: string
                CN_MANDARIN: string
                KR: string
                EN?: string
            }
        }
    }
    bankAlias: {
        [key: string]: string
    }
}

export type MusicDataItem = {
    id: string
    musicId: string
}
