import fs, { promises as fsP } from 'node:fs'
import path from 'node:path'
import yauzl from 'yauzl-promise'
import yazl from 'yazl'

type ReadOpts = {
    encoding?: BufferEncoding
    useAsPrefix?: boolean
}

export async function write(
    content: string | NodeJS.ArrayBufferView,
    filePath: string
) {
    mkdir(path.dirname(filePath))
    return await fsP.writeFile(filePath, content, { flag: 'w' })
}

export function writeSync(
    content: string | NodeJS.ArrayBufferView,
    filePath: string
) {
    mkdir(path.dirname(filePath))
    return fs.writeFileSync(filePath, content, { flag: 'w' })
}

export async function read(
    filePath: string,
    opts: ReadOpts = { encoding: 'utf8', useAsPrefix: false }
) {
    return await fsP.readFile(filePath, { ...opts, flag: 'r' })
}

export function readSync(
    filePath: string,
    opts: ReadOpts = { encoding: 'utf8', useAsPrefix: false }
) {
    const useAsPrefix = opts.useAsPrefix
    delete opts.useAsPrefix
    if (useAsPrefix) {
        const parent = path.dirname(filePath)
        const filename = path.parse(filePath).name
        const ext = path.parse(filePath).ext
        const file = readdirSync(parent).find(
            (e) => e.startsWith(filename) && e.endsWith(ext)
        )
        if (!file) return null
        return fs.readFileSync(path.join(parent, file), {
            ...opts,
            flag: 'r',
        })
    }
    if (exists(filePath)) {
        return fs.readFileSync(filePath, { ...opts, flag: 'r' })
    }
    return null
}

export function exists(filePath: string) {
    return fs.existsSync(filePath)
}

export function rmdir(dir: string) {
    if (exists(dir)) {
        fs.rmSync(dir, { recursive: true })
    }
}

export function rm(dir: string) {
    if (exists(dir)) {
        fs.rmSync(dir, { recursive: true })
    }
}

export function mkdir(dir: string) {
    if (!exists(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

export async function copy(
    sourcePath: string,
    targetPath: string,
    mode = fs.constants.COPYFILE_FICLONE
) {
    if (!exists(sourcePath)) {
        console.warn(`Source file ${sourcePath} does not exist.`)
        return
    }
    mkdir(path.dirname(targetPath))
    return await fsP.copyFile(sourcePath, targetPath, mode)
}

export async function copyDir(
    sourcePath: string,
    targetPath: string,
    mode = fs.constants.COPYFILE_FICLONE
) {
    if (!exists(sourcePath)) {
        console.warn(`Source file ${sourcePath} does not exist.`)
        return
    }
    mkdir(targetPath)
    return await fsP.cp(sourcePath, targetPath, { recursive: true, mode })
}

export function appendSync(content: string | Uint8Array, filePath: string) {
    return fs.appendFileSync(filePath, content, 'utf8')
}

export function readdirSync(dir: string) {
    if (!exists(dir)) {
        console.warn(`Source ${dir} does not exist.`)
        return []
    }
    return fs.readdirSync(dir)
}

export function fileTypeSync(dir: string) {
    if (!exists(dir)) {
        console.warn(`Source ${dir} does not exist.`)
        return null
    }
    return fs.statSync(dir).isDirectory() ? 'dir' : 'file'
}

export const symlink = (source: string, target: string) => {
    if (!exists(source)) {
        console.warn(`Source ${source} does not exist.`)
        return
    }
    if (exists(target)) {
        fs.unlinkSync(target)
    }
    mkdir(path.dirname(target))
    const relative = path.relative(path.dirname(target), source)
    fs.symlinkSync(relative, target)
}

export const symlinkAll = (source: string, target: string) => {
    const files = readdirSync(source)
    files.map((file) => {
        symlink(path.join(source, file), path.join(target, file))
    })
}

export const mv = (source: string, target: string) => {
    if (!exists(source)) {
        console.warn(`Source file ${source} does not exist.`)
        return
    }
    if (exists(target)) {
        rmdir(target)
    }
    mkdir(target)
    fs.renameSync(source, target)
}

export const cpSync = (
    source: string,
    target: string,
    opts = {
        dereference: false,
    }
) => {
    if (!exists(source)) {
        console.warn(`Source file ${source} does not exist.`)
        return
    }
    if (fs.statSync(source).isFile()) {
        mkdir(path.dirname(target))
    } else {
        mkdir(target)
    }
    fs.cpSync(source, target, {
        recursive: true,
        dereference: opts.dereference,
    })
}

export const relative = (source: string, target: string) => {
    if (!exists(source)) {
        console.warn(`Source file ${source} does not exist.`)
        return
    }
    return path.relative(source, target)
}

export const size = (source: string) => {
    if (!exists(source)) {
        console.warn(`Source file ${source} does not exist.`)
        return
    }
    return fs.statSync(source).size
}

export const unzip = yauzl
export const zip = yazl
