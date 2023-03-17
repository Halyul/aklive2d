/* eslint-disable no-undef */
import path from 'path';
import { read } from './yaml.js';

export default function () {
  const musicFolder = path.join(__projectRoot, __config.folder.operator, __config.folder.share, __config.folder.music);
  const musicMapping = read(path.join(musicFolder, 'mapping.yaml'));
  const musicToCopy = Object.values(musicMapping).map(entry => Object.values(entry)).flat(1).filter(entry => entry !== null).map(entry => {
    return {
      filename: entry,
      source: musicFolder,
    }
  })

  return {
    musicToCopy,
    musicMapping,
  }
}