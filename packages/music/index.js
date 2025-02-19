import path from 'path'
import { file } from '@aklive2d/libs'
import { github } from '@aklive2d/downloader'
import config from '@aklive2d/config'

const AUTO_UPDATE_FOLDER = path.resolve(
    import.meta.dirname,
    config.dir_name.auto_update
)
const DATA_DIR = path.resolve(import.meta.dirname, config.dir_name.data)
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
    const metaTable = await github(
        `https://api.github.com/repos/Kengxxiao/ArknightsGameData/commits?path=zh_CN/gamedata/excel/display_meta_table.json`,
        `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/display_meta_table.json`,
        display_meta_table_json
    )
    const audioDataTable = await github(
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
    const musicTable = JSON.parse(file.readSync(MUSIC_TABLE_JSON))
    const musicFileMapping = {}
    const musicFiles = []

    if (!musicTable) return
    for (const item of musicTable) {
        const key = `${item.id}.png`
        musicFileMapping[key] = {}

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

export const mapping = generateMapping()

export const update = async () => {
    const { metaTable, audioDataTable } = await download()
    const musicTable = audioDataTable.musics
    const musicBank = audioDataTable.bgmBanks
    const musicBankAlias = audioDataTable.bankAlias
    const musicData = metaTable.homeBackgroundData.homeBgDataList.reduce(
        (acc, cur) => {
            acc.push({
                id: cur.bgId,
                musicId: cur.bgMusicId,
            })
            return acc
        },
        []
    )
    const list = []
    for (const item of musicData) {
        let bankName = musicTable.find((el) => item.musicId === el.id).bank
        if (typeof musicBankAlias[bankName] !== 'undefined') {
            bankName = musicBankAlias[bankName]
        }
        const obj = musicBank.find((el) => bankName === el.name)
        list.push({
            id: item.id,
            intro: obj.intro,
            loop: obj.loop,
        })
    }
    list.push({
        id: 'operator_bg',
        intro: 'm_sys_void_intro',
        loop: 'm_sys_void_loop',
    })
    file.writeSync(JSON.stringify(list, null), MUSIC_TABLE_JSON)
}
