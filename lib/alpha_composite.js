import sharp from "sharp";
import path from "path";

export default class AlphaComposite {
  #config
  #operatorName
  #operatorSourceFolder

  constructor(config, operatorName, rootDir) {
    this.#config = config
    this.#operatorName = operatorName
    this.#operatorSourceFolder = path.join(rootDir, this.#config.folder.operator, this.#operatorName)
  }

  async process(filename, extractedDir) {
    const image = sharp(path.join(extractedDir, filename))
      .removeAlpha()
    const imageMeta = await image.metadata()
    const imageBuffer = await image.toBuffer()
    const mask = await sharp(path.join(extractedDir, `${path.parse(filename).name}[alpha].png`))
      .extractChannel("blue")
      .resize(imageMeta.width, imageMeta.height)
      .toBuffer();

    return sharp(imageBuffer)
      .joinChannel(mask)
      .toBuffer()

  }

} 