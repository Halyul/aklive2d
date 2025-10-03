import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { file as fileLib } from '@aklive2d/libs'
import pThrottle from 'p-throttle'

export type UnzipDownloadItem = {
    name: string
    url: string
}

export const githubDownload = async (
    history_url: string,
    raw_url: string,
    filepath: string
) => {
    const historyResponse = await fetch(history_url)
    const historyData = await historyResponse.json()
    const lastCommit = historyData[0]
    const lastCommitDate = new Date(lastCommit.commit.committer.date)
    const ext = path.extname(filepath)
    const basename = path.basename(filepath).replace(ext, '')
    filepath = path.join(
        path.dirname(filepath),
        `${basename}_${lastCommitDate.getTime()}${ext}`
    )
    const dirpath = path.dirname(filepath)
    console.log(`Last ${basename} commit date: ${lastCommitDate.getTime()}`)

    if (fileLib.exists(filepath)) {
        console.log(`${basename} is the latest version.`)
        const content = fileLib.readSync(filepath)
        return content ? JSON.parse(content) : null
    }
    const response = await fetch(raw_url)
    const data = await response.json()
    fileLib.writeSync(JSON.stringify(data), filepath)
    console.log(`${basename} is updated.`)

    // remove old file
    const files = fileLib.readdirSync(path.join(dirpath))
    for (const file of files) {
        if (file.startsWith(basename) && file !== path.basename(filepath)) {
            fileLib.rm(path.join(dirpath, file))
        }
    }
    return data
}

export const unzipDownload = async (
    filesToDownload: UnzipDownloadItem[],
    targetDir: string,
    opts: {
        defaultRegex: RegExp | null
        matchRegExps: RegExp[]
    } = {
        defaultRegex: null,
        matchRegExps: [],
    }
) => {
    let retry = filesToDownload
    const throttle = pThrottle({
        limit: 3,
        interval: 1000,
    })
    while (retry.length > 0) {
        const newRetry: UnzipDownloadItem[] = []
        await Promise.all(
            retry.map(
                throttle(async (item) => {
                    const name = item.name
                    console.log(`Downloading ${name} to ${targetDir}`)
                    const zip = await fetch(item.url)
                        .then((resp) => {
                            const status = resp.status
                            if (status !== 200)
                                throw new Error(`Status Code: ${status}`)
                            return resp.arrayBuffer()
                        })
                        .then((arrayBuffer) => {
                            return fileLib.unzip.fromBuffer(
                                Buffer.from(arrayBuffer)
                            )
                        })
                        .catch((err) => {
                            console.error(err)
                            return null
                        })
                    if (!zip) return
                    try {
                        for await (const entry of zip) {
                            if (
                                opts.defaultRegex &&
                                !opts.defaultRegex.test(entry.filename)
                            ) {
                                continue
                            }
                            if (opts.matchRegExps.length > 0) {
                                let shallContinue = false
                                for (const regex of opts.matchRegExps) {
                                    if (!regex.test(entry.filename)) {
                                        shallContinue = true
                                        break
                                    }
                                }
                                if (shallContinue) continue
                            }
                            const filePath = path.join(
                                targetDir,
                                entry.filename
                            )
                            fileLib.mkdir(path.dirname(filePath))
                            const readStream = await entry.openReadStream()
                            const writeStream = fs.createWriteStream(filePath)
                            await pipeline(readStream, writeStream)
                            console.log(
                                `Finish Writing to ${targetDir}/${entry.filename}`
                            )
                        }
                    } finally {
                        await zip.close()
                    }
                })
            )
        )
        retry = newRetry
    }
}
