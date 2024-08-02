/* eslint-disable no-undef */
import path from 'path'
import { appendSync } from './file.js'

export function appendMainConfig(operatorName) {
    appendSync(
        `\n  ${operatorName}: !include config/${operatorName}.yaml`,
        path.join(__projectRoot, 'config.yaml')
    )
}