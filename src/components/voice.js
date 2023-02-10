import charword_table from '!/charword_table.json'
import '@/components/voice.css'

export default class Voice {
    #el
    #widgetEl
    #audioEl = new Audio()
    #audioElId = 'voice-audio'
    #defaultVoiceLang = "JP"
    #defaultRegion = charword_table.config.default_region
    #defaultIdleDuration = 10 * 60 * 1000
    #defaultNextDuration = 3 * 60 * 1000
    #voiceLang = this.#defaultVoiceLang
    #voiceLanguages = Object.keys(this.#getCVInfo(this.#defaultRegion))
    #subtitleLang = this.#defaultRegion
    #useSubtitle = false
    #useVoice = false
    #useVoiceActor = false
    #currentVoiceId = null
    #lastVoiceId = null
    #idleListener = -1
    #idleDuration = this.#defaultIdleDuration
    #nextListener = -1
    #nextDuration = this.#defaultNextDuration
    #lastClickToNext = false
    #voiceFolderObject = this.#getVoiceFolderObject()
    
    constructor(el, widgetEl) {
        this.#el = el
        this.#widgetEl = widgetEl
    }

    init() {
        this.#insertHTML()
        this.#audioEl = document.getElementById(this.#audioElId)
    }

    success() {
        this.#playEntryVoice()
        this.#initNextVoiceTimer()
        this.#widgetEl.addEventListener('click', e => {
            this.#lastClickToNext = true
            this.#nextVoice()
        })
        document.addEventListener('mousemove', e => {
            if (this.#idleListener === -1) {
                this.#initIdleVoiceTimer()
            }
        })
    }

    /**
     * @param {boolean} show
     */
    set useSubtitle(show) {
        this.#useSubtitle = show
    }

    /**
     * @param {boolean} show
     */
    set useVoice(show) {
        this.#useVoice = show
    }

    /**
     * @param {boolean} show
     */
    set useVoiceActor(show) {
        this.#useVoiceActor = show
    }

    /**
     * @param {string} lang
     */
    set subtitleLanguage(lang) {
        if (this.#getSubtitleLanguages().includes(lang)) {
            this.#subtitleLang = lang
        } else {
            this.#subtitleLang = this.#defaultRegion
        }
    }

    get subtitleLanguage() {
        return this.#subtitleLang
    }

    get subtitleLanguages() {
        return this.#getSubtitleLanguages()
    }

    /**
     * @param {string} lang
     */
    set language(lang) {
        if (this.#voiceLanguages.includes(lang)) {
            this.#voiceLang = lang
        } else {
            this.#voiceLang = this.#defaultVoiceLang
        }
        const availableSubtitleLang = this.#getSubtitleLanguages()
        if (!availableSubtitleLang.includes(this.#subtitleLang)) {
            this.#subtitleLang = availableSubtitleLang[0]
        }
    }

    get language() {
        return this.#voiceLang
    }

    get languages() {
        return this.#voiceLanguages
    }

    /**
     * @param {int} duration 
     */
    set idleDuration(duration) {
        clearInterval(this.#idleListener)
        if (duration !== 0) {
            this.#idleDuration = duration * 60 * 1000
            this.#initIdleVoiceTimer()
        }
    }

    get idleDuration() {
        return this.#idleDuration / 60 / 1000
    }

    /**
     * @param {int} duration 
     */
    set nextDuration(duration) {
        clearInterval(this.#nextListener)
        if (duration !== 0) {
            this.#nextDuration = duration * 1000
            this.#initNextVoiceTimer()
        }
    }

    get nextDuration() {
        return this.#nextDuration / 60 / 1000
    }

    #initIdleVoiceTimer() {
        this.#idleListener = setInterval(() => {
            this.#playSpecialVoice("闲置")
            clearInterval(this.#idleListener)
            this.#idleListener = -1
        }, this.#idleDuration) 
    }

    #initNextVoiceTimer() {
        this.#nextListener = setInterval(() => {
            if (!this.#lastClickToNext) {
                this.#nextVoice()
            }
        }, this.#nextDuration)
    }

    #nextVoice() {
        this.#playVoice("CN_001")
    }

    #playEntryVoice() {
        this.#playSpecialVoice("问候")
    }

    #setCurrentSubtitle(id) {
        console.log(id, this.#getSubtitleById(id))
    }

    #playVoice(id) {
        this.#currentVoiceId = id
        this.#audioEl.src = `./assets/${this.#getVoiceFoler()
}/${id}.wav`
        let startPlayPromise = this.#audioEl.play()
        if (startPlayPromise !== undefined) {
            startPlayPromise
                .then(() => {
                    const audioEndedFunc = () => {
                        this.#lastVoiceId = this.#currentVoiceId
                        this.#currentVoiceId = null
                        this.#setCurrentSubtitle(null)
                        this.#lastClickToNext = false
                        this.#audioEl.removeEventListener('ended', audioEndedFunc)
                    }
                    this.#audioEl.addEventListener('ended', audioEndedFunc)
                    this.#setCurrentSubtitle(id)
                })
                .catch(() => {
                    return
                })
        }
    }

    #playSpecialVoice(matcher) {
        const voiceId = this.#getSpecialVoiceId(matcher)
        this.#playVoice(voiceId)
    }

    #getVoiceFoler() {
        const folderObject = this.#voiceFolderObject
        return `${folderObject.main}/${folderObject.sub.find(e => e.lang === this.#voiceLang).name}`
    }

    #getSpecialVoiceId(matcher) {
        const voices = this.#getVoices()
        const voiceId = Object.keys(voices).find(e => voices[e].title === matcher)
        return voiceId
    }

    #getVoices() {
        return charword_table.operator.voice[this.#defaultRegion][this.#getWordKeyByVoiceLang()[this.#defaultVoiceLang]]
    }

    #getSubtitleById(id) {
        return charword_table.operator.voice[this.#subtitleLang][this.#getWordKeyByVoiceLang()[this.#voiceLang]][id]
    }

    #getVoiceFolderObject() {
        const folderObject = JSON.parse(import.meta.env.VITE_VOICE_FOLDERS)
        const languagesCopy = this.#voiceLanguages.slice()
        const customVoiceName = languagesCopy.filter(i => !folderObject.sub.map(e => e.lang).includes(i))[0]
        folderObject.sub = folderObject.sub.map(e => {
            return {
                name: e.name,
                lang: e.lang === "CUSTOM" ? customVoiceName : e.lang
            }
        })
        return folderObject
    }

    /**
     * @returns the cvInfo in the region's language
     */
    #getCVInfo(region) {
        const infoArray = Object.values(charword_table.operator.info[region])
        // combine the infoArray
        let output = {}
        for (const info of infoArray) {
            output = {
                ...output,
                ...info
            }
        }
        return output
    }

    /**
     * @returns the cvInfo corresponsing to the voice language
     */
    #getCVInfoByVoiceLang() {
        const languages = {}
        for (const lang of Object.keys(charword_table.operator.info)) {
            const cvInfo = this.#getCVInfo(lang)
            for (const [voiceLanguage, cvArray] of Object.entries(cvInfo)) {
                if (languages[voiceLanguage] === undefined) {
                    languages[voiceLanguage] = {}
                }
                languages[voiceLanguage][lang] = cvArray
            }
        }
        return languages
    }

    #getWordKeyByVoiceLang() {
        const output = {}
        for (const [wordKey, wordKeyDict] of Object.entries(charword_table.operator.info[this.#defaultRegion])) {
            for (const lang of Object.keys(wordKeyDict)) {
                output[lang] = wordKey
            }
        }
        return output
    }

    #getSubtitleLanguages() {
        return Object.keys(this.#getCVInfoByVoiceLang()[this.#voiceLang])
    }

    #insertHTML() {
        this.#el.innerHTML = `
            <audio id="${this.#audioElId}" autoplay>
                <source type="audio/wav">
                Your browser does not support the audio element.
            </audio>
        `
    }
}