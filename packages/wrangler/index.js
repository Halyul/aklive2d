import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import pThrottle from 'p-throttle'
import { file as fileLib } from '@aklive2d/libs'
import config from '@aklive2d/config'

const dataDir = fs.realpathSync(
    path.join(import.meta.dirname, config.dir_name.data)
)
const distDir = path.join(import.meta.dirname, config.dir_name.dist)

const getHash = (filePath) => {
    return new Promise((res) => {
        const hash = crypto.createHash('md5')
        const rStream = fs.createReadStream(filePath)
        rStream.on('data', (data) => {
            hash.update(data)
        })
        rStream.on('end', () => {
            res(hash.digest('hex'))
        })
    })
}

const isToIgnore = (file) => {
    switch (file) {
        case '.DS_Store':
        case 'index.json':
            return true
        default:
            return false
    }
}

const generateDirTree = async (
    dir,
    opts = {
        baseDir: null,
        calculateHash: false,
        lookupTable: null,
        lookupDir: null,
    }
) => {
    if (!opts.baseDir) opts.baseDir = dir
    const files = fileLib.readdirSync(dir)
    let tree = {
        name: path.basename(dir),
        type: 'dir',
        path: fileLib.relative(opts.baseDir, dir),
        children: [],
    }
    for (const file of files) {
        if (isToIgnore(file)) {
            continue
        }
        const filePath = path.join(dir, file)
        const relativePath = fileLib.relative(opts.baseDir, filePath)
        const dirType = fileLib.fileTypeSync(filePath)
        if (dirType === 'dir') {
            const children = await generateDirTree(filePath, {
                ...opts,
                baseDir: opts.baseDir,
            })
            if (children) tree.children.push(children)
        } else {
            const item = {
                name: file,
                path: relativePath,
                type: 'file',
            }
            if (opts.calculateHash) {
                item.hash = await getHash(filePath)
                if (
                    file.endsWith('.zip') &&
                    opts.lookupTable &&
                    opts.lookupDir
                ) {
                    const children = opts.lookupTable[relativePath]
                    if (children) {
                        let hashes = {}
                        await Promise.all(
                            children.map(async (child) => {
                                hashes[child.name] = await getHash(
                                    path.join(opts.lookupDir, child.path)
                                )
                            })
                        )
                        item.hashes = hashes
                    }
                }
            }
            tree.children.push(item)
        }
    }
    if (tree.children.length === 0) {
        return null
    }
    return tree
}

const flattenChildren = (tree) => {
    if (tree.type === 'dir') {
        return tree.children.flatMap((child) => {
            return flattenChildren(child)
        })
    } else {
        return tree
    }
}

const createZipFile = (name, files, sourceDir, targetDir) => {
    const zipfile = new fileLib.zip.ZipFile()
    files.map((child) => {
        zipfile.addFile(path.join(sourceDir, child.path), child.name)
    })
    zipfile.end()
    zipfile.outputStream.pipe(
        fs.createWriteStream(path.join(targetDir, `${name}.zip`))
    )
}

const generateUploadDist = (item, depth = -1) => {
    const baseDir = path.join(distDir, path.dirname(item.path))
    fileLib.mkdir(baseDir)
    if (item.type === 'dir' && depth === 1) {
        // shall zip dir
        const children = flattenChildren(item)
        const totalSize = 1024 * 1024 * 20
        let count = 0,
            filesToZip = [],
            size = 0
        const ret = {}
        for (const child of children) {
            const currentsize = fileLib.size(path.join(dataDir, child.path))
            if (size + currentsize >= totalSize) {
                createZipFile(
                    `${item.name}-${count}`,
                    [...filesToZip],
                    dataDir,
                    baseDir
                )
                ret[`${item.path}-${count}.zip`] = filesToZip
                count++
                filesToZip = []
                size = 0
            } else {
                filesToZip.push(child)
                size += currentsize
            }
        }
        if (filesToZip.length !== 0) {
            createZipFile(`${item.name}-${count}`, filesToZip, dataDir, baseDir)
            ret[`${item.path}-${count}.zip`] = filesToZip
        }
        return ret
    } else if (item.type === 'dir') {
        if (item.children.length > 0) {
            let ret = {}
            item.children.map((child) => {
                ret = {
                    ...ret,
                    ...generateUploadDist(
                        child,
                        depth === -1 ? depth : depth - 1
                    ),
                }
            })
            return ret
        }
    } else {
        fileLib.cpSync(
            path.join(dataDir, item.path),
            path.join(baseDir, item.name),
            {
                dereference: true,
            }
        )
    }
}

export const upload = async () => {
    fileLib.rmdir(distDir)
    const tree = await generateDirTree(dataDir)
    let ret = {}
    tree.children
        .map((child) => {
            ret = {
                ...ret,
                ...generateUploadDist(child, 3),
            }
        })
        .filter((item) => typeof item !== 'undefined')
    const index = await generateDirTree(distDir, {
        calculateHash: true,
        lookupTable: ret,
        lookupDir: dataDir,
    })
    fileLib.writeSync(
        JSON.stringify(index, null),
        path.join(distDir, 'index.json')
    )
    const wrangler = spawn('pnpm', [
        'wrangler',
        'pages',
        'deploy',
        distDir,
        '--project-name',
        config.akassets.project_name,
    ])
    wrangler.stdout.on('data', (data) => {
        console.log(data.toString())
    })
    wrangler.stderr.on('data', (data) => {
        console.error(data.toString())
    })
}

const generateDownloadList = (data, baseDir, baseUrl = '') => {
    if (data.type === 'dir') {
        let list = []
        const curDir = path.join(baseDir, data.name)
        fileLib.mkdir(curDir)
        if (data.children.length > 0) {
            for (const child of data.children) {
                const filesToDownload = generateDownloadList(
                    child,
                    curDir,
                    baseUrl + data.name + '/'
                )
                if (filesToDownload) {
                    list = [...list, ...filesToDownload]
                }
            }
            return list
        }
    } else {
        return [
            {
                url: `${config.akassets.url}/${baseUrl + data.name.replace(/#/g, '%23')}`,
                target: path.join(baseDir, data.name),
                hash: data.hash,
            },
        ]
    }
    return null
}

export const download = async () => {
    const indexFile = `${config.akassets.url}/index.json`
    const resp = await fetch(indexFile)
    const data = await resp.json()
    let list = data.children.flatMap((child) => {
        return generateDownloadList(child, dataDir)
    })
    const throttle = pThrottle({
        limit: 5,
        interval: 1000,
    })
    while (list.length > 0) {
        const retry = []
        await Promise.all(
            list.map(
                throttle(async (file) => {
                    let isExists = false
                    let suppressedPath = file.target.replace(dataDir, '')
                    if (exists(file.target)) {
                        const hash = await getHash(file.target)
                        if (hash === file.hash) {
                            isExists = true
                            // console.log("File already exists and hash matches:", suppressedPath);
                        }
                    }
                    if (!isExists) {
                        await fetch(file.url)
                            .then((response) => {
                                return response.arrayBuffer()
                            })
                            .then((arraybuffer) => {
                                console.log('Writing to file:', suppressedPath)
                                writeSync(Buffer.from(arraybuffer), file.target)
                                return getHash(file.target)
                            })
                            .then((hash) => {
                                if (hash !== file.hash) {
                                    throw new Error(`Hash mismatch`)
                                }
                            })
                            .catch((err) => {
                                console.log(
                                    `Found error for ${suppressedPath}:`,
                                    err
                                )
                                retry.push(file)
                            })
                    }
                })
            )
        )
        list = retry
    }
}

//TODO: Utilizing github actions to upload base.zip and update.zip
export default class CFPages {
    #uploadPath = path.join(__projectRoot, __config.folder.operator_data)
    #downloadPath = path.join(__projectRoot, __config.folder.operator_data)

    async upload() {
        const tree = await this.#generateDirTree(this.#uploadPath)
        writeSync(
            JSON.stringify(tree, null),
            path.join(this.#uploadPath, 'index.json')
        )
        const wrangler = spawnSync('pnpm', [
            'wrangler',
            'pages',
            'deploy',
            this.#uploadPath,
            '--project-name',
            __config.akassets.project_name,
        ])

        console.log('error', wrangler.error)
        console.log('stdout ', wrangler.stdout.toString())
        console.log('stderr ', wrangler.stderr.toString())
    }

    async download() {
        const indexFile = `${__config.akassets.url}/index.json`
        const resp = await fetch(indexFile)
        const data = await resp.json()
        if (!exists(this.#downloadPath)) mkdir(this.#downloadPath)
        let list = data.children.flatMap((child) => {
            return this.#generateDownloadList(child, this.#downloadPath)
        })
        const throttle = pThrottle({
            limit: 10,
            interval: 100,
        })
        while (list.length > 0) {
            const retry = []
            await Promise.all(
                list.map(
                    throttle(async (file) => {
                        let isExists = false
                        let suppressedPath = file.target.replace(
                            this.#downloadPath,
                            ''
                        )
                        if (exists(file.target)) {
                            const hash = await this.#getHash(file.target)
                            if (hash === file.hash) {
                                isExists = true
                                // console.log("File already exists and hash matches:", suppressedPath);
                            }
                        }
                        if (!isExists) {
                            await fetch(file.url)
                                .then((response) => {
                                    return response.arrayBuffer()
                                })
                                .then((arraybuffer) => {
                                    console.log(
                                        'Writing to file:',
                                        suppressedPath
                                    )
                                    writeSync(
                                        Buffer.from(arraybuffer),
                                        file.target
                                    )
                                    return this.#getHash(file.target)
                                })
                                .then((hash) => {
                                    if (hash !== file.hash) {
                                        throw new Error(`Hash mismatch`)
                                    }
                                })
                                .catch((err) => {
                                    console.log(
                                        `Found error for ${suppressedPath}:`,
                                        err
                                    )
                                    retry.push(file)
                                })
                        }
                    })
                )
            )
            list = retry
        }
    }

    #generateDownloadList(data, baseDir, baseUrl = '') {
        if (data.type === 'dir') {
            let list = []
            const curDir = path.join(baseDir, data.name)
            mkdir(curDir)
            if (data.children.length > 0) {
                for (const child of data.children) {
                    const filesToDownload = this.#generateDownloadList(
                        child,
                        curDir,
                        baseUrl + data.name + '/'
                    )
                    if (filesToDownload) {
                        list = [...list, ...filesToDownload]
                    }
                }
                return list
            }
        } else {
            return [
                {
                    url: `${__config.akassets.url}/${baseUrl + data.name.replace('#', '%23')}`,
                    target: path.join(baseDir, data.name),
                    hash: data.hash,
                },
            ]
        }
        return null
    }

    async #generateDirTree(dir) {
        const files = readdirSync(dir)
        let tree = {
            name: path.basename(dir),
            type: 'dir',
            children: [],
        }
        for (const file of files) {
            if (this.#isToIgnore(file)) {
                continue
            }
            const filePath = path.join(dir, file)
            const dirType = fileTypeSync(filePath)
            if (dirType === 'dir') {
                const children = await this.#generateDirTree(filePath)
                if (children) tree.children.push(children)
            } else {
                tree.children.push({
                    name: file,
                    type: 'file',
                    hash: await this.#getHash(filePath),
                })
            }
        }
        if (tree.children.length === 0) {
            return null
        }
        return tree
    }

    // TODO
    #isToIgnore(file) {
        switch (file) {
            case '.DS_Store':
            case 'index.json':
                return true
            default:
                return false
        }
    }

    #getHash(filePath) {
        return new Promise((res) => {
            const hash = crypto.createHash('md5')
            const rStream = fs.createReadStream(filePath)
            rStream.on('data', (data) => {
                hash.update(data)
            })
            rStream.on('end', () => {
                res(hash.digest('hex'))
            })
        })
    }
}
