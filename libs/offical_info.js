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
        const rows = dom.window.document.body.querySelector(".dynList").querySelectorAll(".row")

        const dict = {
            length: 0
        }

        for (const row of rows) {
            const date = row.querySelector(".date").textContent.trim()
            const operators = []

            const charCards = row.querySelectorAll(".charCard")

            if (dict.length === 0) {
                dict.latest = date
            }

            for (const charCard of charCards) {
                const color = charCard.style.color
                const codename = {
                    "zh-CN": charCard.querySelector(".info").querySelector(".name").querySelector(".text").textContent.trim(),
                    "en-US": charCard.querySelector(".info").querySelector(".codename").textContent.trim()
                }
                const rawType = charCard.querySelector(".typeIcon").querySelector("svg").querySelector("use").getAttribute("xlink:href")
                const link = "https://ak.hypergryph.com" + charCard.getAttribute("href")
                const linkSplited = link.split("/")
                const id = linkSplited[linkSplited.length - 1].replace(".html", "")

                let type;
                switch (rawType) {
                    case "#skin-type-icon-hanger":
                        type = "skin"
                        break;
                    case "#skin-type-icon-promotion2":
                        type = "operator"
                        break;
                }
                operators.push({
                    color,
                    codename,
                    type,
                    link,
                    id
                })
                dict.length++
            }
            dict[date] = operators
        }
        writeSync(JSON.stringify(dict, null, 4), path.join('offical_update.json'))
    }
}
