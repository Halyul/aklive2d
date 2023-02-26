import path from 'path'
import { read, write, readSync } from './file.js'
import AlphaComposite from './alpha_composite.js'

export default class AssetsProcessor {
    #operatorSourceFolder
    #alphaCompositer
    #operatorName
    #shareFolder
    
    constructor(operatorName, shareFolder) {
        this.#operatorSourceFolder = path.join(__projetRoot, __config.folder.operator)
        this.#alphaCompositer = new AlphaComposite()
        this.#operatorName = operatorName
        this.#shareFolder = shareFolder
    }
    
    async process(extractedDir) {
        const fallback_name = __config.operators[this.#operatorName].fallback_name
        const fallbackFilename = `${fallback_name}.png`
        const fallbackBuffer = await this.#alphaCompositer.process(fallbackFilename, `${path.parse(fallbackFilename).name}[alpha].png`, extractedDir)
        await write(fallbackBuffer, path.join(this.#operatorSourceFolder, this.#operatorName, fallbackFilename))
        
        // generate portrait
        const portraitDir = path.join(this.#shareFolder, "portraits")
        const portraitHub = JSON.parse(readSync(path.join(portraitDir, "MonoBehaviour", "portrait_hub.json")))
        const portraitAtlas = portraitHub._sprites.find((item) => item.name === fallback_name).atlas
        const portraitJson = JSON.parse(readSync(path.join(portraitDir, "MonoBehaviour", `portraits#${portraitAtlas}.json`)))
        const item = portraitJson._sprites.find((item) => item.name === fallback_name)
        const rect = {
            ...item.rect,
            rotate: item.rotate
        }
        const protraitFilename = `portraits#${portraitAtlas}.png`
        const portraitBuffer = await this.#alphaCompositer.process(protraitFilename, `${path.parse(protraitFilename).name}a.png`, path.join(portraitDir, "Texture2D"))
        const croppedBuffer = await this.#alphaCompositer.crop(portraitBuffer, rect)
        await write(croppedBuffer, path.join(this.#operatorSourceFolder, this.#operatorName, `${fallback_name}_portrait.png`))

        return {
            landscape: await this.#generateAssets(__config.operators[this.#operatorName].filename, extractedDir),
            portrait: __config.operators[this.#operatorName].portrait ? await this.#generateAssets(__config.operators[this.#operatorName].portrait, extractedDir) : null
        }
    }

    async #generateAssets(filename, extractedDir) {
        const BASE64_BINARY_PREFIX = 'data:application/octet-stream;base64,'
        const BASE64_PNG_PREFIX = 'data:image/png;base64,'
        const assetsJson = {}
        const skelFilename = `${filename}.skel`
        const skel = await read(path.join(extractedDir, skelFilename), null)
        const atlasFilename = `${filename}.atlas`
        const atlas = await read(path.join(extractedDir, atlasFilename))
        const dimensions = atlas.match(new RegExp(/^size:(.*),(.*)/gm))[0].replace('size: ', '').split(',')
        const matches = atlas.match(new RegExp(/(.*).png/g))
        for (const item of matches) {
            const buffer = await this.#alphaCompositer.process(item, `${path.parse(item).name}[alpha].png`, extractedDir)
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