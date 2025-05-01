import path from 'node:path'
import { file } from '@aklive2d/libs'
import { githubDownload } from '@aklive2d/downloader'
import config from '@aklive2d/config'
import type {
    DisplayMetaTable,
    AudioDataTable,
    MusicTable,
    MusicFileMapping,
    MusicFiles,
    MusicItem,
    MusicDataItem,
    MusicMapping,
} from './types.ts'

const AUTO_UPDATE_FOLDER = path.resolve(
    import.meta.dirname,
    config.dir_name.auto_update
)
export const DATA_DIR = path.resolve(import.meta.dirname, config.dir_name.data)
const MUSIC_TABLE_JSON = path.join(
    AUTO_UPDATE_FOLDER,
    config.module.music.music_table_json
)

const download = async () => {
    const display_meta_table_json = path.resolve(
        AUTO_UPDATE_FOLDER,
        config.module.music.display_meta_table_json
    )
    const audio_data_json = path.resolve(
        AUTO_UPDATE_FOLDER,
        config.module.music.audio_data_json
    )
    const metaTable: DisplayMetaTable = await githubDownload(
        `https://api.github.com/repos/Kengxxiao/ArknightsGameData/commits?path=zh_CN/gamedata/excel/display_meta_table.json`,
        `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/display_meta_table.json`,
        display_meta_table_json
    )
    const audioDataTable: AudioDataTable = await githubDownload(
        `https://api.github.com/repos/Kengxxiao/ArknightsGameData/commits?path=zh_CN/gamedata/excel/audio_data.json`,
        `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/audio_data.json`,
        audio_data_json
    )
    return {
        metaTable,
        audioDataTable,
    }
}

const generateMapping = () => {
    const musicFolder = DATA_DIR
    const musicTableContent = file.readSync(MUSIC_TABLE_JSON)
    const musicTable: MusicTable = musicTableContent
        ? JSON.parse(musicTableContent)
        : null
    const musicFileMapping: MusicFileMapping = {}
    const musicFiles: MusicFiles = []

    if (!musicTable) throw new Error('Music table not found')
    for (const item of musicTable) {
        const key = `${item.id}.png`
        musicFileMapping[key] = {} as MusicItem

        if (item.intro) {
            const filename = `${item.intro.split('/').pop()}.ogg`
            musicFileMapping[key].intro = filename
            musicFiles.push({
                filename,
                source: musicFolder,
            })
        } else {
            musicFileMapping[key].intro = null
        }

        if (item.loop) {
            const filename = `${item.loop.split('/').pop()}.ogg`
            musicFileMapping[key].loop = filename
            musicFiles.push({
                filename,
                source: musicFolder,
            })
        } else {
            musicFileMapping[key].loop = null
        }
    }

    return {
        musicFiles,
        musicFileMapping,
    }
}

export const mapping: MusicMapping = generateMapping()

export const update = async () => {
    const { metaTable, audioDataTable } = await download()
    const musicTable = audioDataTable.musics
    const musicBank = audioDataTable.bgmBanks
    const musicBankAlias = audioDataTable.bankAlias
    const musicData: MusicDataItem[] =
        metaTable.homeBackgroundData.homeBgDataList.reduce((acc, cur) => {
            acc.push({
                id: cur.bgId,
                musicId: cur.bgMusicId,
            })
            return acc
        }, [] as MusicDataItem[])
    const list = []
    for (const item of musicData) {
        const bankItem = musicTable.find((el) => item.musicId === el.id)
        if (typeof bankItem === 'undefined')
            console.warn(`No music found for id ${item.musicId}`)
        let bankName = bankItem!.bank
        if (typeof musicBankAlias[bankName] !== 'undefined') {
            bankName = musicBankAlias[bankName]
        }
        const obj = musicBank.find((el) => bankName === el.name)
        if (typeof obj === 'undefined')
            console.warn(`No bank found for name ${bankName}`)
        list.push({
            id: item.id,
            intro: obj!.intro,
            loop: obj!.loop,
        })
    }
    list.push({
        id: 'operator_bg',
        intro: 'm_sys_void_intro',
        loop: 'm_sys_void_loop',
    })
    file.writeSync(JSON.stringify(list, null), MUSIC_TABLE_JSON)
}
