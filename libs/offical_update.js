import jsdom from 'jsdom';
import fetch from "node-fetch";
import path from "path";
import { writeSync } from "./file.js";

export default async function () {
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

            let type;
            switch (rawType) {
                case "#skin-type-icon-hanger":
                    type = "skin"
                    break;
                case "#skin-type-icon-promotion2":
                    type = "elite2"
                    break;
            }
            operators.push({
                color,
                codename,
                type
            })
            dict.length++
        }
        dict[date] = operators
    }
    writeSync(JSON.stringify(dict, null, 4), path.join('offical_update.json'))
}