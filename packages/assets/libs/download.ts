import path from 'node:path'
import { file } from '@aklive2d/libs'
import { unzipDownload, type UnzipDownloadItem } from '@aklive2d/downloader'
import { getOperatorId, getOperatorAlternativeId } from '@aklive2d/operator'
import { mapping } from '@aklive2d/music'
import config from '../index.ts'
import type { UpdateList, ItemToDownload, AbInfosItem } from '../types.ts'

export default async (dataDir: string) => {
    const pidSet: Set<string> = new Set()
    const versionRes: Response = await fetch(
        'https://ak-conf.hypergryph.com/config/prod/official/Android/version'
    )
    const version: string = (await versionRes.json()).resVersion
    const lpacksRes: Response = await fetch(
        `https://ak.hycdn.cn/assetbundle/official/Android/assets/${version}/hot_update_list.json`
    )
    const updateList: UpdateList = await lpacksRes.json()
    const itemToDownload: Set<ItemToDownload> = new Set(config.item_to_download)
    updateList.abInfos.map((item: AbInfosItem) => {
        if (item.name.includes(config.dynchars)) {
            const id = getOperatorId(item.name).replace('.ab', '')
            itemToDownload.add(id)
            itemToDownload.add(getOperatorAlternativeId(id))
        }
    })
    mapping.musicFiles.map((item) => {
        if (!file.exists(path.join(item.source, item.filename))) {
            const filename = item.filename.replace('.ogg', '')
            itemToDownload.add(filename)
        }
    })
    const itemToDownloadRegExp = new RegExp(
        `(.*)(${Array.from(itemToDownload).join('|')})(.*)`
    )
    updateList.abInfos.map((item: AbInfosItem) => {
        if (itemToDownloadRegExp.test(item.name)) {
            if (item.pid) pidSet.add(item.pid)
        }
    })
    const lpacksToDownload: UnzipDownloadItem[] = []
    pidSet.forEach((item) => {
        lpacksToDownload.push({
            name: item,
            url: `https://ak.hycdn.cn/assetbundle/official/Android/assets/${version}/${item}.dat`,
        })
    })
    const regexs = []
    if (config.additional_regex.length > 0) {
        for (const item of config.additional_regex) {
            regexs.push(new RegExp(item))
        }
    }
    await unzipDownload(lpacksToDownload, dataDir, {
        matchRegExps: regexs,
        defaultRegex: itemToDownloadRegExp,
    })
}
