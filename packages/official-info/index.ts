import path from 'node:path'
import config from '@aklive2d/config'
import { file } from '@aklive2d/libs'
import type {
    OfficialDataOperatorObj,
    OfficialDataResp,
    OfficialInfoMapping,
    OfficialInfoOperatorConfigV2,
    OfficialInfoV2,
} from './types'

const AUTO_UPDATE_FOLDER = path.resolve(
    import.meta.dirname,
    config.dir_name.auto_update
)
const OFFICIAL_INFO_JSON = path.resolve(
    AUTO_UPDATE_FOLDER,
    config.module.official_info.official_info_json
)

export const update = async () => {
    const officialDataUrl =
        'https://ak.hypergryph.com/api/archive/dynComp?type=&page='
    let pageNum = 1
    let end = false
    const dict: OfficialInfoV2 = {
        length: 0,
        dates: new Set(),
        info: [],
    }

    while (!end) {
        const f = await fetch(`${officialDataUrl}${pageNum++}`)
        const data: OfficialDataResp = JSON.parse(await f.text())
        if (!dict.length) {
            dict.length = data.data.total
        }
        for (const row of data.data.list) {
            const displayTime = row.content.displayTime.substring(0, 7)
            dict.dates.add(displayTime)
            dict.info.push(get_row(row, displayTime))
        }

        end = data.data.end
    }

    file.writeSync(
        JSON.stringify(
            {
                length: dict.length,
                dates: Array.from(dict.dates),
                info: dict.info,
            },
            null,
            4
        ),
        OFFICIAL_INFO_JSON
    )
}

const get_row = (
    row: OfficialDataOperatorObj,
    date: string
): OfficialInfoOperatorConfigV2 => {
    const type = row.content.type
    let item_type: 'operator' | 'skin'
    switch (type) {
        case 0:
            item_type = 'operator'
            break
        case 1:
            item_type = 'skin'
            break
        default:
            throw 'unknown type'
    }
    return {
        operatorName: row.content.charName,
        skinName: {
            'zh-CN': row.content.suitName,
            'en-US': row.content.codename,
        },
        type: item_type,
        link: `https://ak.hypergryph.com/archive/dynamicCompile/${row.cid}.html`,
        id: Number(row.cid),
        date,
    }
}

const generateMapping = () => {
    const mapping: OfficialInfoMapping = {}
    const content = file.readSync(OFFICIAL_INFO_JSON) as string
    if (!content) throw new Error('Failed to read official info JSON')
    const data: OfficialInfoV2 = JSON.parse(content)
    if (!data) throw new Error('Failed to parse official info JSON')
    data.info.forEach((e) => {
        mapping[e.id] = e
    })
    return mapping
}

export const mapping = generateMapping()
