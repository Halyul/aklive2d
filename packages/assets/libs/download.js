import path from 'node:path'
import { file } from '@aklive2d/libs'
import { unzipDownload } from '@aklive2d/downloader'
import { getOperatorId, getOperatorAlternativeId } from '@aklive2d/operator'
import { mapping } from '@aklive2d/music'
import config from '../index.js'

export default async (dataDir) => {
    const pidSet = new Set()
    const versionRes = await fetch(
        'https://ak-conf.hypergryph.com/config/prod/official/Android/version'
    )
    const version = (await versionRes.json()).resVersion
    const lpacksRes = await fetch(
        `https://ak.hycdn.cn/assetbundle/official/Android/assets/${version}/hot_update_list.json`
    )
    const updateList = await lpacksRes.json()
    const itemToDownload = new Set(config.item_to_download)
    updateList.abInfos.map((item) => {
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
    updateList.abInfos.map((item) => {
        if (itemToDownloadRegExp.test(item.name)) {
            item.pid && pidSet.add(item.pid)
        }
    })
    const lpacksToDownload = []
    pidSet.forEach((item) => {
        lpacksToDownload.push({
            name: item,
            url: `https://ak.hycdn.cn/assetbundle/official/Android/assets/${version}/${item}.dat`,
        })
    })
    await unzipDownload(lpacksToDownload, dataDir, {
        matchRegExp: itemToDownloadRegExp,
    })
}
