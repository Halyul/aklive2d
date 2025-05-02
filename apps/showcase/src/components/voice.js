import {
    insertHTMLChild,
    updateElementPosition,
    updateHTMLOptions,
    showRelatedHTML,
    syncHTMLValue,
} from '@/components/helper'
import '@/components/voice.css'
import buildConfig from '!/config.json'

export default class Voice {
    #el = document.createElement('div')
    #parentEl
    #charwordTable
    #default = {
        region: buildConfig.voice_default_region,
        duration: {
            idle: 10 * 60 * 1000,
            next: 3 * 60 * 1000,
        },
        language: {
            voice: null,
        },
        subtitle: {
            x: 0,
            y: 100,
        },
    }
    #voice = {
        id: {
            current: null,
            last: null,
        },
        listener: {
            idle: -1,
            next: -1,
        },
        lastClickToNext: false,
        locations: null,
        list: null,
    }
    #audio = {
        id: 'voice-audio',
        el: new Audio(),
        isPlaying: false,
    }
    #config = {
        useSubtitle: false,
        useVoice: false,
        useVoiceActor: false,
        language: null,
        subtitle: {
            language: this.#default.region,
            ...this.#default.subtitle,
        },
        duration: { ...this.#default.duration },
    }
    #playerObj

    constructor(el) {
        this.#parentEl = el
        this.#el.id = 'voice-box'
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
        insertHTMLChild(this.#parentEl, this.#el)
    }

    async init() {
        const res = await fetch(
            `${import.meta.env.BASE_URL}${buildConfig.default_assets_dir}charword_table.json`
        )
        this.#charwordTable = await res.json()
        this.#voice.languages = Object.keys(
            this.#charwordTable.voiceLangs[this.#default.region]
        )
        this.#default.language.voice = this.#voice.languages[0]
        this.#config.language = this.#default.language.voice
        this.#voice.locations = this.#getVoiceLocations()
        this.#voice.list = Object.keys(this.#getVoices())
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
        this.#playerObj.node.addEventListener('click', () => {
            this.#audio.lastClickToNext = true
            this.#nextVoice()
        })
        document.addEventListener('mousemove', () => {
            if (this.#voice.listener.idle === -1) {
                this.#initIdleVoiceTimer()
            }
        })
    }

    link(playerObj) {
        this.#playerObj = playerObj
    }

    resetPosition() {
        this.position = { ...this.#default.subtitle }
        document.getElementById('subtitle-padding-x-slider').value =
            this.#default.subtitle.x
        document.getElementById('subtitle-padding-x-input').value =
            this.#default.subtitle.x
        document.getElementById('subtitle-padding-y-slider').value =
            this.#default.subtitle.y
        document.getElementById('subtitle-padding-y-input').value =
            this.#default.subtitle.y
    }

    reset() {
        this.resetPosition()
    }

    #getVoiceLocations() {
        const folders = buildConfig.voice_folders
        const customVoiceName = this.#voice.languages.filter(
            (i) => !folders.sub.map((e) => e.lang).includes(i)
        )[0]
        folders.sub = folders.sub.map((e) => {
            return {
                name: e.name,
                lang: e.lang === 'CUSTOM' ? customVoiceName : e.lang,
            }
        })
        return folders
    }

    #getVoices(lang = null) {
        return this.#charwordTable.subtitleLangs[
            lang ? lang : this.#config.subtitle.language
        ].default
    }

    #playEntryVoice() {
        this.#playSpecialVoice('问候')
    }

    #playSpecialVoice(matcher) {
        const voices = this.#getVoices(buildConfig.voice_default_region)
        const voiceId = Object.keys(voices).find(
            (e) => voices[e].title === matcher
        )
        this.#playVoice(voiceId)
    }

    #playVoice(id) {
        if (!this.useVoice) return
        this.#voice.id.last = this.#voice.id.current
        this.#voice.id.current = id
        this.#audio.el.src = `${import.meta.env.BASE_URL}${buildConfig.default_assets_dir}${this.#getVoiceLocation()}/${id}.ogg`
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
        return `${locations.main}/${locations.sub.find((e) => e.lang === this.#config.language).name}`
    }

    #setCurrentSubtitle(id) {
        if (id === null) {
            setTimeout(() => {
                if (this.#audio.isPlaying) return
                this.#toggleSubtitle(0)
            }, 5 * 1000)
            return
        }
        const subtitle = this.#getSubtitleById(id)
        const title = subtitle.title
        const content = subtitle.text
        const cvInfo =
            this.#charwordTable.voiceLangs[this.subtitleLanguage][
                this.#config.language
            ]
        document.getElementById('voice-title').innerText = title
        document.getElementById('voice-subtitle').innerText = content
        document.getElementById('voice-actor-name').innerText = cvInfo.join('')
        if (this.#audio.isPlaying) {
            this.#toggleSubtitle(1)
        }
    }

    #toggleSubtitle(v) {
        this.#el.style.opacity = v ? 1 : 0
    }

    #getSubtitleById(id) {
        const obj =
            this.#charwordTable.subtitleLangs[this.#config.subtitle.language]
        let key = 'default'
        if (obj[this.#config.language]) {
            key = this.#config.language
        }
        return obj[key][id]
    }

    #getSubtitleLanguages() {
        return Object.keys(this.#charwordTable.subtitleLangs)
    }

    #updateSubtitlePosition() {
        updateElementPosition(this.#el, {
            x: this.position.x,
            y: this.position.y - 100,
        })
    }

    #initNextVoiceTimer() {
        this.#voice.listener.next = setInterval(() => {
            if (!this.#voice.lastClickToNext) {
                this.#nextVoice()
            }
        }, this.#config.duration.next)
    }

    #nextVoice() {
        const getVoiceId = () => {
            const id =
                this.#voice.list[
                    Math.floor(Math.random() * this.#voice.list.length)
                ]
            return id === this.#voice.id.last ? getVoiceId() : id
        }
        this.#playVoice(getVoiceId())
    }

    #initIdleVoiceTimer() {
        this.#voice.listener.idle = setInterval(() => {
            this.#playSpecialVoice('闲置')
            clearInterval(this.#voice.listener.idle)
            this.#voice.listener.idle = -1
        }, this.#config.duration.idle)
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
        this.#toggleSubtitle(0)
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
            this.#config.subtitle.language = lang
        } else {
            this.#config.subtitle.language = this.#default.region
        }
        this.#setCurrentSubtitle(this.#voice.id.current)
    }

    get subtitleLanguage() {
        return this.#config.subtitle.language
    }

    get subtitleLanguages() {
        return this.#getSubtitleLanguages()
    }

    get x() {
        return this.position.x
    }

    set x(v) {
        this.position = {
            x: v,
        }
    }

    get y() {
        return this.position.y
    }

    set y(v) {
        this.position = {
            y: v,
        }
    }

    get position() {
        return {
            x: this.#config.subtitle.x,
            y: this.#config.subtitle.y,
        }
    }

    set position(v) {
        if (typeof v !== 'object') return
        if (v.x) v.x = parseInt(v.x)
        if (v.y) v.y = parseInt(v.y)
        this.#config.subtitle = { ...this.#config.subtitle, ...v }
        console.log(v)
        this.#updateSubtitlePosition()
    }

    set language(lang) {
        if (this.#voice.languages.includes(lang)) {
            this.#config.language = lang
        } else {
            this.#config.language = this.#default.language.voice
        }
        const availableSubtitleLang = this.#getSubtitleLanguages()
        if (!availableSubtitleLang.includes(this.#config.subtitle.language)) {
            this.#config.subtitle.language = availableSubtitleLang[0]
        }
    }

    get language() {
        return this.#config.language
    }

    get languages() {
        return this.#voice.languages
    }

    get duration() {
        return {
            idle: this.#config.duration.idle / 60 / 1000,
            next: this.#config.duration.next / 60 / 1000,
        }
    }

    set duration(v) {
        if (typeof v !== 'object') return
        if (v.idle) {
            clearInterval(this.#voice.listener.idle)
            if (v.idle !== 0) {
                this.#config.duration.idle = parseInt(v.idle) * 60 * 1000
                this.#initIdleVoiceTimer()
            }
        }
        if (v.next) {
            clearInterval(this.#voice.listener.next)
            if (v.next !== 0) {
                this.#config.duration.next = parseInt(v.next) * 60 * 1000
                this.#initNextVoiceTimer()
            }
        }
    }

    get durationIdle() {
        return this.duration.idle
    }

    set durationIdle(duration) {
        this.duration = {
            idle: duration,
        }
    }

    set durationNext(duration) {
        this.duration = {
            next: duration,
        }
    }

    get durationNext() {
        return this.duration.next
    }

    set subtitleX(x) {
        // Note: Back Compatibility
        this.position = {
            x,
        }
    }

    get subtitleX() {
        // Note: Back Compatibility
        return this.position.x
    }

    set subtitleY(y) {
        // Note: Back Compatibility
        this.position = {
            y,
        }
    }

    get subtitleY() {
        // Note: Back Compatibility
        return this.position.y
    }

    set idleDuration(duration) {
        // Note: Back Compatibility
        this.duration = {
            idle: duration,
        }
    }

    get idleDuration() {
        // Note: Back Compatibility
        return this.duration.idle
    }

    set nextDuration(duration) {
        // Note: Back Compatibility
        this.duration.next = duration
    }

    get nextDuration() {
        // Note: Back Compatibility
        return this.duration.next
    }

    get config() {
        return { ...this.#config }
    }

    get HTML() {
        return `
    <div>
      <label for="voice">Voice</label>
      <input type="checkbox" id="voice" name="voice" ${this.useVoice ? 'checked' : ''}/>
      <div id="voice-realted" ${this.useVoice ? '' : 'hidden'}>
        <div>
          <label for="voice-lang-select">Choose the language of voice:</label>
          <select name="voice-lang" id="voice-lang-select">
            ${updateHTMLOptions(this.languages)}
          </select>
        </div>
        <div>
          <label for="voice-idle-duration">Idle Duration (min)</label>
          <input type="number" id="voice-idle-duration-input" min="0" name="voice-idle-duration" value="${this.duration.idle}" />
        </div>
        <div>
          <label for="voice-next-duration">Next Duration (min)</label>
          <input type="number" id="voice-next-duration-input" name="voice-next-duration" value="${this.duration.next}" />
        </div>
        <div>
          <label for="subtitle">Subtitle</label>
          <input type="checkbox" id="subtitle" name="subtitle" ${this.useSubtitle ? 'checked' : ''}/>
          <div id="subtitle-realted" ${this.useSubtitle ? '' : 'hidden'}>
            <div>
              <label for="subtitle-lang-select">Choose the language of subtitle:</label>
              <select name="subtitle-lang" id="subtitle-lang-select">
                ${updateHTMLOptions(this.subtitleLanguages)}
              </select>
            </div>
            <div>
              <label for="subtitle-padding-x">Subtitle X Position</label>
              <input type="range" min="0" max="100" id="subtitle-padding-x-slider" value="${this.position.x}" />
              <input type="number" id="subtitle-padding-x-input" name="subtitle-padding-x" value="${this.position.x}" />
            </div>
            <div>
              <label for="subtitle-padding-y">Subtitle Y Position</label>
              <input type="range" min="0" max="100" id="subtitle-padding-y-slider" value="${this.position.y}" />
              <input type="number" id="subtitle-padding-y-input" name="subtitle-padding-y" value="${this.position.y}" />
            </div>
            <div>
              <label for="voice-actor">Voice Actor</label>
              <input type="checkbox" id="voice-actor" name="voice-actor" ${this.useVoiceActor ? 'checked' : ''}/>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
    }

    get listeners() {
        return [
            {
                id: 'voice',
                event: 'click',
                handler: (e) => {
                    showRelatedHTML(e.currentTarget, 'voice-realted')
                    this.useVoice = e.currentTarget.checked
                },
            },
            {
                id: 'voice-lang-select',
                event: 'change',
                handler: (e) => {
                    this.language = e.currentTarget.value
                },
            },
            {
                id: 'voice-idle-duration-input',
                event: 'change',
                handler: (e) => {
                    this.duration = {
                        idle: e.currentTarget.value,
                    }
                },
            },
            {
                id: 'voice-next-duration-input',
                event: 'change',
                handler: (e) => {
                    this.duration = {
                        next: e.currentTarget.value,
                    }
                },
            },
            {
                id: 'subtitle',
                event: 'click',
                handler: (e) => {
                    showRelatedHTML(e.currentTarget, 'subtitle-realted')
                    this.useSubtitle = e.currentTarget.checked
                },
            },
            {
                id: 'subtitle-lang-select',
                event: 'change',
                handler: (e) => (this.subtitleLanguage = e.currentTarget.value),
            },
            {
                id: 'subtitle-padding-x-slider',
                event: 'input',
                handler: (e) => {
                    syncHTMLValue(e.currentTarget, 'subtitle-padding-x-input')
                    this.position = {
                        x: e.currentTarget.value,
                    }
                },
            },
            {
                id: 'subtitle-padding-x-input',
                event: 'change',
                handler: (e) => {
                    syncHTMLValue(e.currentTarget, 'subtitle-padding-x-slider')
                    this.position = {
                        x: e.currentTarget.value,
                    }
                },
            },
            {
                id: 'subtitle-padding-y-slider',
                event: 'input',
                handler: (e) => {
                    syncHTMLValue(e.currentTarget, 'subtitle-padding-y-input')
                    this.position = {
                        y: e.currentTarget.value,
                    }
                },
            },
            {
                id: 'subtitle-padding-y-input',
                event: 'change',
                handler: (e) => {
                    syncHTMLValue(e.currentTarget, 'subtitle-padding-y-slider')
                    this.position = {
                        y: e.currentTarget.value,
                    }
                },
            },
            {
                id: 'voice-actor',
                event: 'click',
                handler: (e) => {
                    this.useVoiceActor = e.currentTarget.checked
                },
            },
        ]
    }

    applyConfig(key, value) {
        switch (key) {
            case 'use-voice':
                this.useVoice = value
                break
            case 'language':
                this.language = value
                break
            case 'duration':
                this.duration = value
                break
            case 'use-subtitle':
                this.useSubtitle = value
                break
            case 'subtitle-language':
                this.subtitleLanguage = value
                break
            case 'subtitle-position':
                this.position = value
                break
            case 'use-voice-actor':
                this.useVoiceActor = value
                break
            default:
                return
        }
    }
}
