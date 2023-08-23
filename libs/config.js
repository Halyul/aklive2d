/* eslint-disable no-undef */
import path from 'path'
import { read } from './yaml.js'
import { getOperatorId } from './charword_table.js'

export default function () {
    return process(read(path.join(__projectRoot, 'config.yaml')))
}

function process(config) {
    for (const [operatorName, operator] of Object.entries(config.operators)) {
        // add title
        operator.title = `${config.share.title["en-US"]}${operator.codename["en-US"]} - ${config.share.title["zh-CN"]}${operator.codename["zh-CN"]}`
        // add type
        operator.type = operator.codename["zh-CN"].includes('·') ? 'skin' : 'operator'

        // add link
        operator.link = operatorName

        // id
        operator.id = getOperatorId(operator).replace(/^(char_)(\d+)(_.+)$/g, '$2')
    }

    return config
}