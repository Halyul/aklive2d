import path from 'path'
import { read } from './yaml.js'

export default function () {
    return process(read(path.join(__projetRoot, 'config.yaml')))
}

function process(config) {
    for (const [operatorName, operator] of Object.entries(config.operators)) {
        // add title
        operator.title = `${config.share.title["en-US"]}${operator.codename["en-US"]} - ${config.share.title["zh-CN"]}${operator.codename["zh-CN"]}`
        // add type
        operator.type = operator.codename["zh-CN"].includes('·') ? 'operator' : 'skin'

        // add link
        operator.link = operatorName
    }

    return config
}