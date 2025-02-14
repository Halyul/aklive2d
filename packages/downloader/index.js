import fetch from "node-fetch"
import path from "node:path"
import { file as fileLib } from "@aklive2d/libs"

export default class Downloader {

  async github(history_url, raw_url, filepath) {
    const historyResponse = await fetch(history_url)
    const historyData = await historyResponse.json()
    const lastCommit = historyData[0]
    const lastCommitDate = new Date(lastCommit.commit.committer.date)
    const ext = path.extname(filepath)
    const basename = path.basename(filepath).replace(ext, '')
    filepath = path.join(path.dirname(filepath), `${basename}_${lastCommitDate.getTime()}${ext}`)
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
}