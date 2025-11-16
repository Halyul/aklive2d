import path from 'node:path'
import { type UnzipDownloadItem, unzipDownload } from '@aklive2d/downloader'
import { file } from '@aklive2d/libs'
import { mapping } from '@aklive2d/music'
import { getOperatorAlternativeId, getOperatorId } from '@aklive2d/operator'
import config from '../index.ts'
import type { AbInfosItem, ItemToDownload, UpdateList } from '../types.ts'

export default async (dataDir: string) => {
    await Promise.all(
        config.servers.map(async (server) => {
            const networkConfResp = await fetch(server.url)
            const networkConf = JSON.parse(
                (await networkConfResp.json()).content.replace(/\\/g, '')
            )
            const funcVer = networkConf.funcVer
            const networkConfUrls = networkConf.configs[funcVer].network
            await download(dataDir, {
                hv: networkConfUrls.hv.replace('{0}', 'Android'),
                hu: networkConfUrls.hu,
            })
        })
    )
}

const download = async (
    dataDir: string,
    urls: {
        hv: string
        hu: string
    }
) => {
    const pidSet: Set<string> = new Set()
    const versionRes: Response = await fetch(urls.hv)
    const version: string = (await versionRes.json()).resVersion
    const lpacksRes: Response = await fetch(
        `${urls.hu}/Android/assets/${version}/hot_update_list.json`
    )
    console.log(urls, lpacksRes)
    const updateList: UpdateList = await lpacksRes.json()
    const itemToDownload: Set<ItemToDownload> = new Set(config.item_to_download)
    updateList.abInfos.map((item: AbInfosItem) => {
        if (item.name.includes(config.dynchars)) {
            const id = getOperatorId(item.name).replace('.ab', '')
            const alternativeId = getOperatorAlternativeId(id)
            itemToDownload.add(id)
            itemToDownload.add(alternativeId)
        }
    })
    mapping.musicFiles.map((item) => {
        if (!file.exists(path.join(item.source, item.filename))) {
            const filename = item.filename
                .replace('.ogg', '')
                .replace(/_(intro|loop)/, '')
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
            url: `${urls.hu}/Android/assets/${version}/${item}.dat`,
        })
    })
    const regexs = []
    if (config.additional_regex.length > 0) {
        for (const item of config.additional_regex) {
            regexs.push(new RegExp(item))
        }
    }
    console.log(lpacksToDownload, itemToDownloadRegExp, regexs)
    await unzipDownload(lpacksToDownload, dataDir, {
        matchRegExps: regexs,
        defaultRegex: itemToDownloadRegExp,
    })
}
