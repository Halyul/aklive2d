import sharp from "sharp";
import path from "path";

export default class AlphaComposite {

  async process(filename, maskFilename, extractedDir) {
    const image = sharp(path.join(extractedDir, filename))
      .removeAlpha()
    const imageMeta = await image.metadata()
    const imageBuffer = await image.toBuffer()
    const mask = await sharp(path.join(extractedDir, maskFilename))
      .extractChannel("blue")
      .resize(imageMeta.width, imageMeta.height)
      .toBuffer();

    return sharp(imageBuffer)
      .joinChannel(mask)
      .toBuffer()
  }

  async crop(buffer, rect) {
    const left = rect.y
    const top = rect.x
    const width = rect.h
    const height = rect.w
    const rotate = rect.rotate === 0 ? -90 : 0
    const newImage = await sharp(buffer).rotate(90).extract({ left: left, top: top, width: width, height: height }).resize(width, height).extract({ left: 0, top: 0, width: width, height: height }).toBuffer()
    return await sharp(newImage).rotate(rotate).toBuffer()
  }

} 