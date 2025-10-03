import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { BACKGROUND_DIR as BACKGROUND_DATA_DIR } from '@aklive2d/background'
import config from '@aklive2d/config'
import { unzipDownload } from '@aklive2d/downloader'
import { file as fileLib } from '@aklive2d/libs'
import { DATA_DIR as MUSIC_DATA_DIR } from '@aklive2d/music'
import { OPERATOR_SOURCE_FOLDER as OPERATOR_DATA_DIR } from '@aklive2d/operator'
import * as showcaseDirs from '@aklive2d/showcase'
import pThrottle from 'p-throttle'
import type {
    DirTree,
    DownloadList,
    GenerateDirTreeOpts,
    HashItem,
    LookupTable,
} from './types.ts'

const dataDir = path.join(import.meta.dirname, config.dir_name.data)
const distDir = path.join(import.meta.dirname, config.dir_name.dist)

const getHash = (filePath: string): Promise<string> => {
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

const isToIgnore = (file: string) => {
    switch (file) {
        case '.DS_Store':
        case 'index.json':
            return true
        default:
            return false
    }
}

const generateDirTree = async (
    dir: string,
    opts: GenerateDirTreeOpts = {
        calculateHash: false,
    }
): Promise<DirTree | null> => {
    if (!opts.baseDir) opts.baseDir = dir
    const files = fileLib.readdirSync(dir)
    const tree = {
        name: path.basename(dir),
        type: 'dir',
        path: fileLib.relative(opts.baseDir, dir),
        children: [] as DirTree[],
    } as DirTree
    for (const file of files) {
        if (isToIgnore(file)) {
            continue
        }
        const filePath = path.join(dir, file)
        const relativePath = fileLib.relative(opts.baseDir, filePath)
        const dirType = fileLib.fileTypeSync(filePath)
        if (dirType === 'dir') {
            const children = (await generateDirTree(filePath, {
                ...opts,
                baseDir: opts.baseDir,
            })) as DirTree
            if (children) tree.children.push(children)
        } else {
            const item = {
                name: file,
                path: relativePath,
                type: 'file',
            } as DirTree
            if (opts.calculateHash) {
                item.hash = await getHash(filePath)
                if (
                    file.endsWith('.zip') &&
                    opts.lookupTable &&
                    opts.lookupDir
                ) {
                    const children = opts.lookupTable[relativePath!]
                    if (children) {
                        const hashes = [] as HashItem[]
                        await Promise.all(
                            children.map(async (child) => {
                                hashes.push({
                                    path: child.path,
                                    hash: await getHash(
                                        path.join(opts.lookupDir!, child.path)
                                    ),
                                })
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

const flattenChildren = (
    tree: DirTree,
    prepend: string | null = null
): DirTree | DirTree[] => {
    const head = prepend ? `${prepend}/` : ''
    if (tree.type === 'dir') {
        return tree.children.flatMap((child: DirTree) => {
            return flattenChildren(child, `${head}${tree.name}`)
        })
    } else {
        return {
            ...tree,
            name: `${head}${tree.name}`,
        }
    }
}

const createZipFile = (
    name: string,
    files: DirTree[],
    sourceDir: string,
    targetDir: string
) => {
    const zipfile = new fileLib.zip.ZipFile()
    files.map((child) => {
        zipfile.addFile(path.join(sourceDir, child.path), child.name)
    })
    zipfile.end()
    zipfile.outputStream.pipe(
        fs.createWriteStream(path.join(targetDir, `${name}.zip`))
    )
}

const generateUploadDist = (item: DirTree, depth = -1) => {
    const baseDir = path.join(distDir, path.dirname(item.path))
    fileLib.mkdir(baseDir)
    if (item.type === 'dir' && depth === 1) {
        // shall zip dir
        const children = flattenChildren(item) as DirTree[]
        let count = 0,
            filesToZip = [] as DirTree[],
            size = 0
        const ret = {} as LookupTable
        for (const child of children) {
            const currentsize = fileLib.size(path.join(dataDir, child.path))
            if (size + currentsize! >= config.total_size) {
                createZipFile(
                    `${item.name}-${count}`,
                    [...filesToZip],
                    dataDir,
                    baseDir
                )
                ret[`${item.path}-${count}.zip`] = filesToZip
                count++
                filesToZip = [child]
                size = currentsize!
            } else {
                filesToZip.push(child)
                size += currentsize!
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

const wranglerDeploy = (distDir: string, project_name: string) => {
    const wrangler = spawn('pnpm', [
        'wrangler',
        'pages',
        'deploy',
        distDir,
        '--project-name',
        project_name,
    ])
    wrangler.stdout.on('data', (data) => {
        console.log(data.toString())
    })
    wrangler.stderr.on('data', (data) => {
        console.error(data.toString())
    })
    wrangler.on('close', () => {
        fileLib.rmdir(distDir)
    })
}

export const upload = async () => {
    const tree = (await generateDirTree(dataDir)) as DirTree
    let ret = {}
    if (!tree) throw new Error('No data to upload.')
    tree.children
        .map((child: DirTree) => {
            ret = {
                ...ret,
                ...generateUploadDist(child, 3),
            }
        })
        .filter((item) => typeof item !== 'undefined') // ?
    const index = await generateDirTree(distDir, {
        calculateHash: true,
        lookupTable: ret as LookupTable,
        lookupDir: dataDir,
    })
    fileLib.writeSync(
        JSON.stringify(index, null),
        path.join(distDir, config.module.wrangler.index_json)
    )
    wranglerDeploy(distDir, config.akassets.project_name)
}

const generateDownloadList = (
    data: DirTree,
    baseDir: string,
    baseUrl = ''
): DownloadList | DownloadList[] => {
    if (data.type === 'dir') {
        const curDir = path.join(baseDir, data.path)
        fileLib.mkdir(curDir)
        if (data.children.length > 0) {
            return data.children.flatMap((child) => {
                return generateDownloadList(
                    child,
                    baseDir,
                    baseUrl + data.name + '/'
                )
            })
        } else {
            return []
        }
    } else {
        const base = {
            name: data.name,
            url: `${config.akassets.url}/${baseUrl + data.name.replace(/#/g, '%23')}`,
            target: path.join(baseDir, data.path),
            hash: data.hash,
        } as DownloadList
        if (data.name.endsWith('.zip') && data.hashes) {
            base.children = data.hashes.map((hash) => {
                return {
                    target: path.join(baseDir, hash.path),
                    hash: hash.hash,
                }
            })
            base.target = path.join(baseDir, data.path.replace(/-\d+.zip/g, ''))
        }
        return base
    }
}

export const download = async () => {
    fileLib.mkdir(OPERATOR_DATA_DIR)
    fileLib.mkdir(MUSIC_DATA_DIR)
    fileLib.mkdir(BACKGROUND_DATA_DIR)

    const indexFile = `${config.akassets.url}/${config.module.wrangler.index_json}`
    const resp = await fetch(indexFile)
    const data = (await resp.json()) as DirTree
    let list = data.children.flatMap((child) => {
        return generateDownloadList(child, dataDir)
    })
    const throttle = pThrottle({
        limit: 5,
        interval: 500,
    })
    while (list.length > 0) {
        const retry = [] as DownloadList[]
        await Promise.all(
            list.map(
                throttle(async (file) => {
                    let isExists = true
                    const relativePath = fileLib.relative(dataDir, file.target)
                    if (file.name.endsWith('.zip') && file.children) {
                        for (
                            let i = 0;
                            i < file.children.length && isExists;
                            i++
                        ) {
                            const child = file.children[i]
                            if (fileLib.exists(child.target)) {
                                isExists =
                                    (await getHash(child.target)) === child.hash
                            } else {
                                isExists = false
                            }
                        }
                    } else if (fileLib.exists(file.target)) {
                        isExists = (await getHash(file.target)) === file.hash
                    } else {
                        isExists = false
                    }

                    if (!isExists) {
                        if (file.name.endsWith('.zip')) {
                            await unzipDownload(
                                [
                                    {
                                        url: file.url,
                                        name: relativePath!,
                                    },
                                ],
                                path.dirname(file.target)
                            )
                        } else {
                            console.log(`Downloading ${relativePath}`)
                            await fetch(file.url)
                                .then((response) => {
                                    if (!response.ok) {
                                        throw new Error(
                                            `Failed to download ${relativePath}`
                                        )
                                    }
                                    return response.arrayBuffer()
                                })
                                .then((arraybuffer) => {
                                    fileLib.writeSync(
                                        Buffer.from(arraybuffer),
                                        file.target
                                    )
                                    return getHash(file.target)
                                })
                                .then((hash) => {
                                    if (hash !== file.hash) {
                                        throw new Error(`Hash mismatch`)
                                    }
                                    console.log(
                                        `Finish Writing to ${relativePath}`
                                    )
                                })
                                .catch((err) => {
                                    console.log(
                                        `Found error for ${relativePath}:`,
                                        err
                                    )
                                    retry.push(file)
                                })
                        }
                    }
                })
            )
        )
        list = retry
    }
}

export const deploy = async () => {
    const distDir = path.resolve(showcaseDirs.DIST_DIR)
    wranglerDeploy(distDir, config.site_id)
}
