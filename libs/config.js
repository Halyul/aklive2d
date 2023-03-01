import path from 'path'
import { read } from './yaml.js'
import { read as readVersion } from './version.js'
import { getOperatorId } from './charword_table.js'

export default function () {
    return process(read(path.join(__projetRoot, 'config.yaml')))
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

    // version
    config.version = {
        showcase: readVersion(path.join(__projetRoot)),
        directory: readVersion(path.join(__projetRoot, 'directory')),
    }

    return config
}