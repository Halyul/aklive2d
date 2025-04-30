import jsdom from 'jsdom'
import path from 'node:path'
import { file } from '@aklive2d/libs'
import config from '@aklive2d/config'

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
    let data
    scripts.forEach((e) => {
        if (e.textContent.includes('干员晋升')) {
            data = JSON.parse(
                e.textContent
                    .replace('self.__next_f.push([1,"c:', '')
                    .replace('\\n"])', '')
                    .replaceAll('\\', '')
            )
        }
    })
    const rows = data[0][3].initialData

    const dict = {
        length: rows.length,
        dates: [],
    }

    let current_displayTime = rows[0].displayTime
    let current_block = []

    for (const row of rows) {
        const displayTime = row.displayTime
        if (displayTime !== current_displayTime) {
            dict[current_displayTime] = current_block
            dict.dates.push(current_displayTime)
            current_displayTime = row.displayTime
            current_block = []
        }
        current_block.push(get_row(row))
    }
    dict[current_displayTime] = current_block
    dict.dates.push(current_displayTime)

    file.writeSync(JSON.stringify(dict, null, 4), OFFICIAL_INFO_JSON)
}

const get_row = (row) => {
    const type = row.type
    let codename_zhCN, item_type
    switch (type) {
        case 0:
            codename_zhCN = row.charName
            item_type = 'operator'
            break
        case 1:
            codename_zhCN = row.suitName + ' · ' + row.charName
            item_type = 'skin'
            break
        default:
            throw 'unknown type'
    }
    return {
        codename: {
            'zh-CN': codename_zhCN,
            'en-US': row.codename,
        },
        type: item_type,
        link: `https://ak.hypergryph.com/archive/dynamicCompile/${row.cid}.html`,
        id: row.cid,
    }
}

const generateMapping = () => {
    const mapping = {}
    const data = JSON.parse(file.readSync(OFFICIAL_INFO_JSON))
    if (!data) return
    Object.keys(data).forEach((key) => {
        if (typeof data[key] === 'object') {
            data[key].forEach((operator) => {
                mapping[operator.id] = {
                    date: key,
                    ...operator,
                }
            })
        }
    })
    return mapping
}

export const mapping = generateMapping()
