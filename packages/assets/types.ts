export type Config = {
    dynchars: string
    item_to_download: ItemToDownload[]
    additional_regex: string[]
}

export type ItemToDownload = string

export type UpdateList = {
    versionId: string
    abInfos: AbInfosItem[]
    manifestName: string
    manifestVersion: string
    packInfos: PackInfosItem[]
}

export type AbInfosItem = {
    name: string
    hash: string
    md5: string
    totalSize: number
    abSize: number
    cid: number
    cat?: number
    pid?: string
}

export type PackInfosItem = {
    name: string
    hash: string
    md5: string
    totalSize: number
    abSize: number
    cid: number
}
