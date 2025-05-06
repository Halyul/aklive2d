import jsdom from 'jsdom'
import path from 'node:path'
import { file } from '@aklive2d/libs'
import config from '@aklive2d/config'
import type {
    OfficialArray,
    OfficialInfoV2,
    OfficialOperatorInfo,
    OfficialInfoMapping,
    OfficialInfoOperatorConfigV2,
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
    const f = await fetch('https://ak.hypergryph.com/archive/dynamicCompile/')
    const html_text = await f.text()

    const dom = new jsdom.JSDOM(html_text)
    const scripts = dom.window.document.body.querySelectorAll('script')
    let data: OfficialArray | null = null
    scripts.forEach((e) => {
        if (e.textContent?.includes('干员晋升')) {
            data = JSON.parse(
                e.textContent
                    .replace('self.__next_f.push([1,"c:', '')
                    .replace('\\n"])', '')
                    .replaceAll('\\', '')
            ) as OfficialArray
        }
    })
    if (!data) throw new Error('No data found')
    const rows = (data as OfficialArray)[0][3].initialData

    const dict: OfficialInfoV2 = {
        length: rows.length,
        dates: [],
        info: [],
    }

    let current_displayTime = rows[0].displayTime

    for (const row of rows) {
        const displayTime = row.displayTime
        if (displayTime !== current_displayTime) {
            dict.dates.push(current_displayTime)
            current_displayTime = row.displayTime
        }
        dict.info.push(get_row(row, current_displayTime))
    }
    dict.dates.push(current_displayTime)

    file.writeSync(JSON.stringify(dict, null, 4), OFFICIAL_INFO_JSON)
}

const get_row = (
    row: OfficialOperatorInfo,
    date: string
): OfficialInfoOperatorConfigV2 => {
    const type = row.type
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
        operatorName: row.charName,
        skinName: {
            'zh-CN': row.suitName,
            'en-US': row.codename,
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
