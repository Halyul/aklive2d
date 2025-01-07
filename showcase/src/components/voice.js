import { insertChild, updateElementPosition } from "@/components/helper";

import charword_table from '!/charword_table.json'
import '@/components/voice.css'


export default class Voice {
    #el = document.createElement("div")
    #parentEl
    #widgetEl
    #default = {
        region: charword_table.config.default_region,
        duration: {
            idle: 10 * 60 * 1000,
            next: 3 * 60 * 1000
        },
        language: {
            voice: null
        },
        subtitle: {
            x: 0,
            y: 0
        }
    }
    #voice = {
        languages: Object.keys(charword_table.voiceLangs[this.#default.region]),
        id: {
            current: null,
            last: null
        },
        listener: {
            idle: -1,
            next: -1
        },
        lastClickToNext: false,
        locations: null,
        list: null
    }
    #audio = {
        id: "voice-audio",
        el: new Audio(),
        isPlaying: false
    }
    #config = {
        useSubtitle: false,
        useVoice: false,
        useVoiceActor: false,
        voiceLang: null,
        subtitleLang: this.#default.region,
        subtitleX: this.#default.subtitle.x,
        subtitleY: this.#default.subtitle.y,
        durationIdle: this.#default.duration.idle,
        durationNext: this.#default.duration.next
    }

    constructor() {
        this.#default.language.voice = this.#voice.languages[0]
        this.#config.voiceLang = this.#default.language.voice
        this.#voice.locations = this.#getVoiceLocations()
        this.#voice.list = Object.keys(this.#getVoices())
    }

    set useSubtitle(show) {
        this.#config.useSubtitle = show
        this.#el.hidden = !show
    }

    get useSubtitle() {
        return this.#config.useSubtitle
    }

    set useVoice(show) {
        this.#config.useVoice = show
        this.#playEntryVoice()
        if (!show && this.#audio.isPlaying) {
            this.#audio.el.pause()
        }
    }

    get useVoice() {
        return this.#config.useVoice
    }

    set useVoiceActor(show) {
        this.#config.useVoiceActor = show
        document.getElementById('voice-actor-box').hidden = !show
    }

    get useVoiceActor() {
        return this.#config.useVoiceActor
    }

    set subtitleLanguage(lang) {
        if (this.#getSubtitleLanguages().includes(lang)) {
            this.#config.subtitleLang = lang
        } else {
            this.#config.subtitleLang = this.#default.region
        }
        this.#setCurrentSubtitle(this.#voice.id.current)
    }

    get subtitleLanguage() {
        return this.#config.subtitleLang
    }

    get subtitleLanguages() {
        return this.#getSubtitleLanguages()
    }

    set subtitleX(x) {
        this.#config.subtitleX = x
        this.#updateSubtitlePosition()
    }

    get subtitleX() {
        return this.#config.subtitleX
    }

    set subtitleY(y) {
        this.#config.subtitleY = y - 100
        this.#updateSubtitlePosition()
    }

    get subtitleY() {
        return this.#config.subtitleY + 100
    }

    set language(lang) {
        if (this.#voice.languages.includes(lang)) {
            this.#config.voiceLang = lang
        } else {
            this.#config.voiceLang = this.#default.language.voice
        }
        const availableSubtitleLang = this.#getSubtitleLanguages()
        if (!availableSubtitleLang.includes(this.#config.subtitleLang)) {
            this.#config.subtitleLang = availableSubtitleLang[0]
        }
    }

    get language() {
        return this.#config.voiceLang
    }

    get languages() {
        return this.#voice.languages
    }

    set durationIdle(duration) {
        clearInterval(this.#voice.listener.idle)
        if (duration !== 0) {
            this.#config.durationIdle = duration * 60 * 1000
            this.#initIdleVoiceTimer()
        }
    }

    set idleDuration(duration) {
        // Note: Back Compatibility
        this.durationIdle = duration
    }

    get durationIdle() {
        return this.#config.durationIdle / 60 / 1000
    }

    get idleDuration() {
        // Note: Back Compatibility
        return this.durationIdle
    }

    set durationNext(duration) {
        clearInterval(this.#voice.listener.next)
        if (duration !== 0) {
            this.#config.durationNext = duration * 60 * 1000
            this.#initNextVoiceTimer()
        }
    }

    set nextDuration(duration) {
        // Note: Back Compatibility
        this.durationNext = duration
    }

    get durationNext() {
        return this.#config.durationNext / 60 / 1000
    }

    get nextDuration() {
        // Note: Back Compatibility
        return this.durationNext
    }

    init(el, widgetEl) {
        this.#parentEl = el
        this.#widgetEl = widgetEl
        this.#el.id = "voice-box"
        this.#el.hidden = true
        this.#el.innerHTML = `
            <audio id="${this.#audio.id}" autoplay>
                <source type="audio/ogg" />
            </audio>
            <div class="voice-wrapper" id="voice-wrapper">
                <div class="voice-title" id="voice-title"></div>
                <div class="voice-subtitle">
                <div id="voice-subtitle"></div>
                <div class="voice-triangle"></div>
                </div>
            </div>
            <div id="voice-actor-box" hidden>
                <div class="voice-actor">
                <span class="voice-actor-icon"></span>
                <span id="voice-actor-name" class="voice-actor-name"></span>
                </div>
            </div>
        `
        insertChild(this.#parentEl, this.#el)
    }

    success() {
        const audioEndedFunc = () => {
            this.#audio.isPlaying = false
            this.#setCurrentSubtitle(null)
            this.#audio.lastClickToNext = false
        }
        this.#audio.el.addEventListener('ended', audioEndedFunc)
        this.#playEntryVoice()
        this.#initNextVoiceTimer()
        this.#widgetEl.addEventListener('click', () => {
            this.#audio.lastClickToNext = true
            this.#nextVoice()
        })
        document.addEventListener('mousemove', () => {
            if (this.#voice.listener.idle === -1) {
                this.#initIdleVoiceTimer()
            }
        })
    }

    #getVoiceLocations() {
        const folders = JSON.parse(import.meta.env.VITE_VOICE_FOLDERS)
        const customVoiceName = this.#voice.languages.filter(i => !folders.sub.map(e => e.lang).includes(i))[0]
        folders.sub = folders.sub.map(e => {
            return {
                name: e.name,
                lang: e.lang === "CUSTOM" ? customVoiceName : e.lang
            }
        })
        return folders
    }

    #getVoices() {
        return charword_table.subtitleLangs[this.#config.subtitleLang].default
    }

    #playEntryVoice() {
        this.#playSpecialVoice("问候")
    }

    #playSpecialVoice(matcher) {
        const voices = this.#getVoices()
        const voiceId = Object.keys(voices).find(e => voices[e].title === matcher)
        this.#playVoice(voiceId)
    }

    #playVoice(id) {
        if (!this.useVoice) return
        this.#voice.id.last = this.#voice.id.current
        this.#voice.id.current = id
        this.#audio.el.src = `./assets/${this.#getVoiceLocation()
            }/${id}.ogg`
        let startPlayPromise = this.#audio.el.play()
        if (startPlayPromise !== undefined) {
            startPlayPromise
                .then(() => {
                    this.#audio.isPlaying = true
                    this.#setCurrentSubtitle(id)
                })
                .catch(() => {
                    return
                })
        }
    }

    #getVoiceLocation() {
        const locations = this.#voice.locations
        return `${locations.main}/${locations.sub.find(e => e.lang === this.#config.voiceLang).name}`
    }

    #setCurrentSubtitle(id) {
        if (id === null) {
            setTimeout(() => {
                if (this.#audio.isPlaying) return
                this.#el.style.opacity = 0
            }, 5 * 1000);
            return
        }
        const subtitle = this.#getSubtitleById(id)
        const title = subtitle.title
        const content = subtitle.text
        const cvInfo = charword_table.voiceLangs[this.subtitleLanguage][this.#config.voiceLang]
        document.getElementById('voice-title').innerText = title
        document.getElementById('voice-subtitle').innerText = content
        this.#el.style.opacity = 1
        document.getElementById('voice-actor-name').innerText = cvInfo.join('')
    }

    #getSubtitleById(id) {
        const obj = charword_table.subtitleLangs[this.#config.subtitleLang]
        let key = 'default'
        if (obj[this.#config.voiceLang]) {
            key = this.#config.voiceLang
        }
        return obj[key][id]
    }

    #getSubtitleLanguages() {
        return Object.keys(charword_table.subtitleLangs)
    }

    #updateSubtitlePosition() {
        updateElementPosition(this.#el, this.#config.subtitleX, this.#config.subtitleY)
    }

    #initNextVoiceTimer() {
        this.#voice.listener.next = setInterval(() => {
            if (!this.#voice.lastClickToNext) {
                this.#nextVoice()
            }
        }, this.#config.durationNext)
    }

    #nextVoice() {
        const getVoiceId = () => {
            const id = this.#voice.list[Math.floor((Math.random() * this.#voice.list.length))]
            return id === this.#voice.id.last ? getVoiceId() : id
        }
        this.#playVoice(getVoiceId())
    }

    #initIdleVoiceTimer() {
        this.#voice.listener.idle = setInterval(() => {
            this.#playSpecialVoice("闲置")
            clearInterval(this.#voice.listener.idle)
            this.#voice.listener.idle = -1
        }, this.#config.durationIdle)
    }
}