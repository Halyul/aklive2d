/* eslint-disable no-undef */
import path from 'path'
import { read, write, readSync, exists, copy } from './file.js'
import AlphaComposite from './alpha_composite.js'

export default class AssetsProcessor {
    #operatorSourceFolder
    #alphaCompositer
    #operatorName
    #shareFolder
    
    constructor(operatorName, shareFolder) {
        this.#operatorSourceFolder = path.join(__projectRoot, __config.folder.operator)
        this.#alphaCompositer = new AlphaComposite()
        this.#operatorName = operatorName
        this.#shareFolder = shareFolder
    }
    
    async process(extractedDir) {
        const fallback_name = __config.operators[this.#operatorName].fallback_name
        const fallbackFilename = `${fallback_name}.png`
        const alphaCompositeFilename = `${path.parse(fallbackFilename).name}[alpha].png`
        if (exists(path.join(extractedDir, alphaCompositeFilename))) {
            const fallbackBuffer = await this.#alphaCompositer.process(fallbackFilename, alphaCompositeFilename, extractedDir)
            await write(fallbackBuffer, path.join(this.#operatorSourceFolder, this.#operatorName, fallbackFilename))
        } else {
            await copy(path.join(extractedDir, fallbackFilename), path.join(this.#operatorSourceFolder, this.#operatorName, fallbackFilename))
        }
        
        // generate portrait
        const portraitDir = path.join(this.#shareFolder, "portraits")
        const portraitHub = JSON.parse(readSync(path.join(portraitDir, "MonoBehaviour", "portrait_hub.json")))
        const fallback_name_lowerCase = fallback_name.toLowerCase()
        const portraitAtlas = portraitHub._sprites.find((item) => item.name.toLowerCase() === fallback_name_lowerCase).atlas
        const portraitJson = JSON.parse(readSync(path.join(portraitDir, "MonoBehaviour", `portraits#${portraitAtlas}.json`)))
        const item = portraitJson._sprites.find((item) => item.name.toLowerCase() === fallback_name_lowerCase)
        const rect = {
            ...item.rect,
            rotate: item.rotate
        }
        const protraitFilename = `portraits#${portraitAtlas}.png`
        const portraitBuffer = await this.#alphaCompositer.process(protraitFilename, `${path.parse(protraitFilename).name}a.png`, path.join(portraitDir, "Texture2D"))
        const croppedBuffer = await this.#alphaCompositer.crop(portraitBuffer, rect)
        await write(croppedBuffer, path.join(this.#operatorSourceFolder, this.#operatorName, `${fallback_name}_portrait.png`))

        return await this.generateAssets(__config.operators[this.#operatorName].filename, extractedDir, __config.operators[this.#operatorName].use_json)
    }

    async generateAssets(filename, extractedDir, useJSON=false) {
        const BASE64_BINARY_PREFIX = 'data:application/octet-stream;base64,'
        const BASE64_PNG_PREFIX = 'data:image/png;base64,'
        const assetsJson = {}

        let skelFilename;
        if (useJSON) {
            skelFilename = `${filename}.json`
        } else {
            skelFilename = `${filename}.skel`
        }
        const skel = await read(path.join(extractedDir, skelFilename), null)
        const atlasFilename = `${filename}.atlas`
        const atlas = await read(path.join(extractedDir, atlasFilename))
        const dimensions = atlas.match(new RegExp(/^size:(.*),(.*)/gm))[0].replace('size: ', '').split(',')
        const matches = atlas.match(new RegExp(/(.*).png/g))
        for (const item of matches) {
            let buffer;
            const alphaCompositeFilename = `${path.parse(item).name}[alpha].png`
            if (exists(path.join(extractedDir, alphaCompositeFilename))) {
                buffer = await this.#alphaCompositer.process(item, alphaCompositeFilename, extractedDir)
            } else {
                buffer = await this.#alphaCompositer.toBuffer(item, extractedDir)
            }
            assetsJson[`./assets/${item}`] = BASE64_PNG_PREFIX + buffer.toString('base64')
        }
        assetsJson[`./assets/${skelFilename.replace('#', '%23')}`] = BASE64_BINARY_PREFIX + skel.toString('base64')
        assetsJson[`./assets/${atlasFilename.replace('#', '%23')}`] = BASE64_BINARY_PREFIX + Buffer.from(atlas).toString('base64')
        return {
            dimensions,
            assetsJson
        }
    }
}