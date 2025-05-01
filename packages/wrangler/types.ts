export type GenerateDirTreeOpts = {
    baseDir?: string
    calculateHash?: boolean
    lookupTable?: LookupTable
    lookupDir?: string
}

export interface DirTree {
    name: string
    type: 'dir' | 'file'
    path: string
    children: DirTree[]
    hash?: string
    hashes?: HashItem[]
}

export type LookupTable = {
    [key: string]: DirTree[]
}

export type HashItem = {
    path: string
    hash: string
}

export type DownloadList = {
    name: string
    url: string
    target: string
    hash: string
    children?: {
        target: string
        hash: string
    }[]
}
