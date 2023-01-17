import path from 'path'
import { parse } from 'yaml'
import fs from 'fs'

function read_yaml(file_dir) {
  const include = {
    identify: value => value.startsWith('!include'),
    tag: '!include',
    resolve(str) {
      const dir = path.resolve(BASEDIR, str)
      const data = read_yaml(dir)
      return data
    }
  }
  const file = fs.readFileSync(file_dir, 'utf8')
  return parse(file, {
    customTags: [include],
  })
}

const BASEDIR = path.resolve(__dirname, '..')
const CONFIG = read_yaml(path.join(BASEDIR, 'config.yaml'))

export default {
  basedir: BASEDIR,
  ...CONFIG
}