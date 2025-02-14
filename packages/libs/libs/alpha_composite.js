import sharp from "sharp";
import path from "path";

export const process = async (filename, maskFilename, extractedDir) => {
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

export const crop = async (buffer, rect) => {
  const left = rect.y
  const top = rect.x
  const width = rect.h
  const height = rect.w
  const rotate = rect.rotate === 0 ? -90 : 0
  const newImage = await sharp(buffer).rotate(90).extract({ left: left, top: top, width: width, height: height }).resize(width, height).extract({ left: 0, top: 0, width: width, height: height }).toBuffer()
  return await sharp(newImage).rotate(rotate).toBuffer()
}

export const toBuffer = async (filename, extractedDir) => {
  const file = path.join(extractedDir, filename)
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info;
  const pixelArray = new Uint8ClampedArray(data.buffer);
  for (let i = 0; i < pixelArray.length; i += 4) {
    let alpha = pixelArray[i + 3] / 255;
    pixelArray[i + 0] = pixelArray[i + 0] * alpha
    pixelArray[i + 1] = pixelArray[i + 1] * alpha
    pixelArray[i + 2] = pixelArray[i + 2] * alpha
  }

  return await sharp(pixelArray, { raw: { width, height, channels } }).png().toBuffer();
}