import sharp from "sharp";
import path from "path";

const d = {
    "name": "char_1013_chen2_2",
    "guid": "d618831d436cac34e8df33d793b31fe5",
    "atlas": 0,
    "rect": {
        "x": 2,
        "y": 724,
        "w": 360,
        "h": 180
    },
    "rotate": 1
}

const image = await sharp("portraits#1.png").removeAlpha().toBuffer()
// const imageMeta = await image.metadata()
// const imageBuffer = await image.toBuffer()
const mask = await sharp("portraits#1a.png")
    .extractChannel("blue")
    .toBuffer();

// // const resultImage = await sharp(imageBuffer).joinChannel(mask).toBuffer()

const combined = await sharp(image).joinChannel(mask)
//     .extract({ left: 724, top: 2, width: 180, height: 360 })
    .toBuffer();

await sharp(combined).rotate(90).extract({ left: 724, top: 2, width: 180, height: 360 }).resize(180, 360).extract({ left: 0, top: 0, width: 180, height: 360 }).toFile("test.png")