/* eslint-disable no-undef */
import fetch from "node-fetch"
import path from "path"
import { exists, writeSync, readdirSync, rm, readSync } from "./file.js"

export default class Downloader {

    async github(history_url, raw_url, filepath) {
        const historyResponse = await fetch(history_url)
        const historyData = await historyResponse.json()
        const lastCommit = historyData[0]
        const lastCommitDate = new Date(lastCommit.commit.committer.date)
        console.log(`Last commit date: ${lastCommitDate.getTime()}`)
        const basename = path.basename(filepath)
        const ext = path.extname(filepath)
        filepath = path.join(filepath, "..", `${basename}_${lastCommitDate.getTime()}${ext}`)

        if (exists(filepath)) {
            console.log(`${basename} is the latest version.`)
            return JSON.parse(readSync(filepath))
        }
        const response = await fetch(raw_url)
        const data = await response.json()
        writeSync(JSON.stringify(data), filepath)
        console.log(`${basename} is updated.`)

        // remove old file
        const files = readdirSync(path.join(__projectRoot, __config.folder.operator, __config.folder.share))
        for (const file of files) {
            if (file.startsWith(basename) && file !== path.basename(filepath)) {
                rm(path.join(__projectRoot, __config.folder.operator, __config.folder.share, file))
            }
        }
        return data
    }
}