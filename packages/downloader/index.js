import path from 'node:path'
import fs from 'node:fs'
import { Buffer } from 'node:buffer'
import yauzl from 'yauzl'
import { file as fileLib } from '@aklive2d/libs'

export const github = async (history_url, raw_url, filepath) => {
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
        return JSON.parse(fileLib.readSync(filepath))
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

export const unzip = async (
    filesToDownload,
    targetDir,
    opts = {
        matchRegExp: null,
    }
) => {
    let retry = filesToDownload
    while (retry.length > 0) {
        const newRetry = []
        for (const item of retry) {
            const name = item.name
            console.log(`Downloading ${name}`)
            await fetch(item.url)
                .then((resp) => {
                    const status = resp.status
                    if (status !== 200)
                        throw new Error(`Status Code: ${status}`)
                    return resp.arrayBuffer()
                })
                .then((arrayBuffer) => {
                    const buffer = Buffer.from(arrayBuffer)
                    yauzl.fromBuffer(
                        buffer,
                        { lazyEntries: true },
                        (err, zipfile) => {
                            if (err) throw err
                            zipfile.readEntry()
                            zipfile.on('entry', (entry) => {
                                if (
                                    /\/$/.test(entry.fileName) ||
                                    !opts.matchRegExp?.test(entry.fileName)
                                ) {
                                    // Directory file names end with '/'.
                                    // Note that entries for directories themselves are optional.
                                    // An entry's fileName implicitly requires its parent directories to exist.
                                    zipfile.readEntry()
                                } else {
                                    // file entry
                                    const filePath = path.join(
                                        targetDir,
                                        entry.fileName
                                    )
                                    fileLib.mkdir(path.dirname(filePath))
                                    zipfile.openReadStream(
                                        entry,
                                        (err, readStream) => {
                                            if (err) throw err
                                            const writeStream =
                                                fs.createWriteStream(filePath)
                                            readStream.on('end', () => {
                                                zipfile.readEntry()
                                            })
                                            readStream.pipe(writeStream)
                                            writeStream.on('finish', () => {
                                                console.log(
                                                    `Finish Writing to ${entry.fileName}`
                                                )
                                            })
                                        }
                                    )
                                }
                            })
                        }
                    )
                })
        }
        retry = newRetry
    }
}
