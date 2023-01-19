import path from 'path';
import fs from 'fs';
import sharp from "sharp";

export default class Background {
  #config
  #rootDir
  #backgroundFolder
  #extractFolder
  #files

  constructor(config, rootDir) {
    this.#config = config;
    this.#rootDir = rootDir;
    this.#backgroundFolder = path.join(rootDir, config.folder.operator, '_share', config.folder.background);
    this.#extractFolder = path.join(this.#backgroundFolder, 'extracted');
  }

  async process() {
    this.#files = fs.readdirSync(this.#extractFolder).filter((f) => {
      return f.endsWith('.png') && f.includes('_left');
    })
    if (this.#files.length + 2 !== fs.readdirSync(this.#backgroundFolder).length) {
      await Promise.all(this.#files.map(async (f) => {
        const filenamePrefix = path.parse(f).name.replace('_left', '');
        await this.#composite(filenamePrefix, '.png');
      }))
    } else {
      console.log('Background images already exist, skip generation.')
    }
  }

  async #composite(filenamePrefix, fileExt) {
    const image = sharp(path.join(this.#extractFolder, `${filenamePrefix}_left${fileExt}`))
    const metadata = await image.metadata()

    image
      .resize(2 * metadata.width, metadata.height, {
        kernel: sharp.kernel.nearest,
        fit: 'contain',
        position: 'left top',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .composite([
        {
          input: path.join(this.#extractFolder, `${filenamePrefix}_right${fileExt}`),
          top: 0,
          left: metadata.width,
        },
      ])
      .toFile(path.join(this.#backgroundFolder, `${filenamePrefix}${fileExt}`));
  }

  get files() {
    return this.#files.map(f => f.replace('_left', ''))
  }

  getFilesToCopy(publicAssetsDir) {
    return this.#files.map((f) => {
      return {
        filename: f.replace('_left', ''),
        source: path.join(this.#backgroundFolder),
        target: path.join(publicAssetsDir, this.#config.folder.background)
      };
    })
  }
}