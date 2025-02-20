import fs, { promises as fsP } from 'fs'
import path from 'path'

export async function write(content, filePath) {
  mkdir(path.dirname(filePath))
  return await fsP.writeFile(filePath, content, { flag: 'w' })
}

export function writeSync(content, filePath) {
  mkdir(path.dirname(filePath))
  return fs.writeFileSync(filePath, content, { flag: 'w' })
}

export async function read(filePath, encoding = 'utf8') {
  return await fsP.readFile(filePath, encoding, { flag: 'r' })
}

export function readSync(filePath, encoding = 'utf8') {
  if (exists(filePath)) {
    return fs.readFileSync(filePath, encoding, { flag: 'r' })
  }
  return null
}

export function exists(filePath) {
  return fs.existsSync(filePath)
}

export function rmdir(dir) {
  if (exists(dir)) {
    fs.rmSync(dir, { recursive: true })
  }
}

export function rm(file) {
  if (exists(file)) {
    fs.rmSync(file)
  }
}

export function mkdir(dir) {
  if (!exists(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export async function copy(sourcePath, targetPath) {
  if (!exists(sourcePath)) {
    console.warn(`Source file ${sourcePath} does not exist.`)
    return
  }
  mkdir(path.dirname(targetPath))
  return await fsP.copyFile(sourcePath, targetPath)
}

export async function copyDir(sourcePath, targetPath) {
  if (!exists(sourcePath)) {
    console.warn(`Source file ${sourcePath} does not exist.`)
    return
  }
  mkdir(targetPath)
  return await fsP.cp(sourcePath, targetPath, { recursive: true })
}

export function appendSync(content, filePath) {
  return fs.appendFileSync(filePath, content, 'utf8');
}

export function readdirSync(dir) {
  if (!exists(dir)) {
    console.warn(`Source ${dir} does not exist.`)
    return []
  }
  return fs.readdirSync(dir)
}

export function fileTypeSync(dir) {
  if (!exists(dir)) {
    console.warn(`Source ${dir} does not exist.`)
    return null
  }
  return fs.statSync(dir).isDirectory() ? 'dir' : 'file'
}
