/* eslint-disable no-undef */
import path from 'path';
import fs from 'fs';
import sharp from "sharp";
import { mkdir } from './file.js'

export default class Background {
  #backgroundFolder
  #backgroundOutputFolder
  #extractFolder
  #files

  constructor(shareDir, targetDir) {
    this.#backgroundFolder = path.join(shareDir, __config.folder.background);
    this.#backgroundOutputFolder = path.join(targetDir, `_${__config.folder.background}`);
    this.#extractFolder = path.join(this.#backgroundFolder, 'extracted');
    mkdir(this.#backgroundOutputFolder);
  }

  async process() {
    this.#files = fs.readdirSync(this.#extractFolder).filter((f) => {
      return f.endsWith('.png') && f.includes('_left');
    })
    await Promise.all(this.#files.map(async (f) => {
      const filenamePrefix = path.parse(f).name.replace('_left', '');
      await this.#composite(filenamePrefix, '.png');
    }))
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
      .toFile(path.join(this.#backgroundOutputFolder, `${filenamePrefix}${fileExt}`));
  }

  get files() {
    return this.#files.map(f => f.replace('_left', ''))
  }

  getFilesToCopy(publicAssetsDir) {
    return this.#files.map((f) => {
      return {
        filename: f.replace('_left', ''),
        source: path.join(this.#backgroundOutputFolder),
        target: path.join(publicAssetsDir, __config.folder.background)
      };
    })
  }
}