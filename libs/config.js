/* eslint-disable no-undef */
import path from 'path'
import { read } from './yaml.js'
import { getOperatorId } from './charword_table.js'

export default function (officalInfo) {
    return process(read(path.join(__projectRoot, 'config.yaml')), officalInfo)
}

function process(config, officalInfo) {    
    for (const [operatorName, operator] of Object.entries(config.operators)) {
        const operatorInfo = officalInfo.find(operator.offical_id)
        // add title
        operator.title = `${config.share.title["en-US"]}${operator.codename["en-US"]} - ${config.share.title["zh-CN"]}${operator.codename["zh-CN"]}`
        // add type
        operator.type = operatorInfo.type

        // add link
        operator.link = operatorName

        // id
        operator.id = getOperatorId(operator).replace(/^(char_)(\d+)(_.+)$/g, '$2')

        operator.color = operatorInfo.color

        operator.date = operatorInfo.date
    }

    return config
}