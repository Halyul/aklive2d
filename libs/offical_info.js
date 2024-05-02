import jsdom from 'jsdom';
import fetch from "node-fetch";
import path from "path";
import { writeSync, readSync } from "./file.js";

export default class OfficalInfo {
    // eslint-disable-next-line no-undef
    #data = JSON.parse(readSync(path.join(__projectRoot, 'offical_update.json')))
    #idMapping = {}

    constructor() {
        Object.keys(this.#data).forEach((key) => {
            this.#idMapping[this.#data[key].id] 
            if (typeof this.#data[key] === 'object') {
                this.#data[key].forEach((operator) => {
                    this.#idMapping[operator.id] = {
                        date: key,
                        ...operator
                    }
                })
            }
        })
    }

    find(id) {
        return this.#idMapping[id]
    }
    
    async update() {
        const f = await fetch("https://ak.hypergryph.com/archive/dynamicCompile/")
        const html_text = await f.text()

        const dom = new jsdom.JSDOM(html_text);
        const scripts = dom.window.document.body.querySelectorAll("script");
        let data;
        scripts.forEach((e) => {
            if (e.textContent.includes("干员晋升")) {
                data = JSON.parse(e.textContent.replace("self.__next_f.push([1,\"c:", "").replace("\\n\"])", "").replaceAll("\\", ""))
            }
        })
        const rows = data[0][3].initialData

        const dict = {
            length: rows.length,
            dates: []
        }

        let current_displayTime = rows[0].displayTime
        let current_block = []

        for (const row of rows) {
            const displayTime = row.displayTime
            if (displayTime !== current_displayTime) {
                dict[current_displayTime] = current_block;
                dict.dates.push(current_displayTime);
                current_displayTime = row.displayTime;
                current_block = [];
            }
            current_block.push(this.get_row(row))
        }
        dict[current_displayTime] = current_block;
        dict.dates.push(current_displayTime);

        writeSync(JSON.stringify(dict, null, 4), path.join('offical_update.json'))
    }

    get_row(row) {
        const type = row.type;
        let codename_zhCN, item_type;
        switch (type) {
            case 0:
                codename_zhCN = row.charName
                item_type = "operator"
                break;
            case 1:
                codename_zhCN = row.suitName + " · " + row.charName
                item_type = "skin"
                break;
            default:
                throw ("unknown type");
        }
        return {
            color: null,
            codename: {
                "zh-CN": codename_zhCN,
                "en-US": row.codename
            },
            type: item_type,
            link: `https://ak.hypergryph.com/archive/dynamicCompile/${row.cid}.html`,
            id: row.cid
        }
    }
}
