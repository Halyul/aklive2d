import path from 'node:path'
import sharp from 'sharp'

export type Rect = {
    x: number
    y: number
    w: number
    h: number
    rotate: number
}

export const process = async (
    filename: string,
    maskFilename: string,
    extractedDir: string
) => {
    const image = sharp(path.join(extractedDir, filename)).removeAlpha()
    const imageMeta = await image.metadata()
    const imageBuffer = await image.toBuffer()
    const mask = await sharp(path.join(extractedDir, maskFilename))
        .extractChannel('blue')
        .resize(imageMeta.width, imageMeta.height)
        .toBuffer()

    return sharp(imageBuffer).joinChannel(mask).toBuffer()
}

export const crop = async (
    buffer:
        | Buffer
        | ArrayBuffer
        | Uint8Array
        | Uint8ClampedArray
        | Int8Array
        | Uint16Array
        | Int16Array
        | Uint32Array
        | Int32Array
        | Float32Array
        | Float64Array
        | string,
    rect: Rect
) => {
    const left = rect.y
    const top = rect.x
    const width = rect.h
    const height = rect.w
    const rotate = rect.rotate === 0 ? -90 : 0
    const newImage = await sharp(buffer)
        .rotate(90)
        .extract({ left: left, top: top, width: width, height: height })
        .resize(width, height)
        .extract({ left: 0, top: 0, width: width, height: height })
        .toBuffer()
    return await sharp(newImage).rotate(rotate).toBuffer()
}

export const toBuffer = async (filename: string, extractedDir: string) => {
    const file = path.join(extractedDir, filename)
    const { data, info } = await sharp(file)
        .raw()
        .toBuffer({ resolveWithObject: true })
    const { width, height, channels } = info
    const pixelArray = new Uint8ClampedArray(data.buffer)
    for (let i = 0; i < pixelArray.length; i += 4) {
        const alpha = pixelArray[i + 3] / 255
        pixelArray[i + 0] = pixelArray[i + 0] * alpha
        pixelArray[i + 1] = pixelArray[i + 1] * alpha
        pixelArray[i + 2] = pixelArray[i + 2] * alpha
    }

    return await sharp(pixelArray, { raw: { width, height, channels } })
        .png()
        .toBuffer()
}
