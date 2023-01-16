import path from 'path'
import { copy, read, write } from './file.js'
import AlphaComposite from './alpha_composite.js'

export default class AssetsProcessor {
    #config
    #operatorName
    #operatorSourceFolder
    #alphaCompositer
    
    constructor(config, operatorName, rootDir) {
        this.#config = config
        this.#operatorName = operatorName
        this.#operatorSourceFolder = path.join(rootDir, this.#config.folder.operator)
        this.#alphaCompositer = new AlphaComposite(config, operatorName, rootDir)
    }
    
    async process(publicAssetsDir, extractedDir) {
        const BASE64_BINARY_PREFIX = 'data:application/octet-stream;base64,'
        const BASE64_PNG_PREFIX = 'data:image/png;base64,'   
        const assetsJson = {}
        const skelFilename = `${this.#config.operators[this.#operatorName].filename}.skel`
        const skel = await read(path.join(extractedDir, skelFilename), null)
        const atlasFilename = `${this.#config.operators[this.#operatorName].filename}.atlas`
        const atlas = await read(path.join(extractedDir, atlasFilename))
        const dimensions = atlas.match(new RegExp(/^size:(.*),(.*)/gm))[0].replace('size: ', '').split(',')
        const matches = atlas.match(new RegExp(/(.*).png/g))
        for (const item of matches) {
            const buffer = await this.#alphaCompositer.process(item, extractedDir)
            assetsJson[`./assets/${item}`] = BASE64_PNG_PREFIX + buffer.toString('base64')
        }
        assetsJson[`./assets/${skelFilename.replace('#', '%23')}`] = BASE64_BINARY_PREFIX + skel.toString('base64')
        assetsJson[`./assets/${atlasFilename.replace('#', '%23')}`] = BASE64_BINARY_PREFIX + Buffer.from(atlas).toString('base64')

        const fallbackFilename = `${this.#config.operators[this.#operatorName].fallback_name}.png`
        const fallbackBuffer = await this.#alphaCompositer.process(fallbackFilename, extractedDir)
        await write(fallbackBuffer, path.join(this.#operatorSourceFolder, this.#operatorName, fallbackFilename))
        await copy(path.join(this.#operatorSourceFolder, this.#operatorName, fallbackFilename), path.join(publicAssetsDir, fallbackFilename))
        return {
            dimensions,
            assetsJson
        }
    }
}