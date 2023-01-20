import path from 'path'
import { copy, read, write } from './file.js'
import AlphaComposite from './alpha_composite.js'

export default class AssetsProcessor {
    #operatorSourceFolder
    #alphaCompositer
    
    constructor() {
        this.#operatorSourceFolder = path.join(__dirname, __config.folder.operator)
        this.#alphaCompositer = new AlphaComposite()
    }
    
    async process(extractedDir) {
        const BASE64_BINARY_PREFIX = 'data:application/octet-stream;base64,'
        const BASE64_PNG_PREFIX = 'data:image/png;base64,'   
        const assetsJson = {}
        const skelFilename = `${__config.operators[__operator_name].filename}.skel`
        const skel = await read(path.join(extractedDir, skelFilename), null)
        const atlasFilename = `${__config.operators[__operator_name].filename}.atlas`
        const atlas = await read(path.join(extractedDir, atlasFilename))
        const dimensions = atlas.match(new RegExp(/^size:(.*),(.*)/gm))[0].replace('size: ', '').split(',')
        const matches = atlas.match(new RegExp(/(.*).png/g))
        for (const item of matches) {
            const buffer = await this.#alphaCompositer.process(item, extractedDir)
            assetsJson[`./assets/${item}`] = BASE64_PNG_PREFIX + buffer.toString('base64')
        }
        assetsJson[`./assets/${skelFilename.replace('#', '%23')}`] = BASE64_BINARY_PREFIX + skel.toString('base64')
        assetsJson[`./assets/${atlasFilename.replace('#', '%23')}`] = BASE64_BINARY_PREFIX + Buffer.from(atlas).toString('base64')

        const fallbackFilename = `${__config.operators[__operator_name].fallback_name}.png`
        const fallbackBuffer = await this.#alphaCompositer.process(fallbackFilename, extractedDir)
        await write(fallbackBuffer, path.join(this.#operatorSourceFolder, __operator_name, fallbackFilename))
        return {
            dimensions,
            assetsJson
        }
    }
}