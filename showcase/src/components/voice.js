import charword_table from '!/charword_table.json'
import '@/components/voice.css'

export default class Voice {
  #el
  #widgetEl
  #audioEl = new Audio()
  #audioElId = 'voice-audio'
  #defaultRegion = charword_table.config.default_region
  #defaultIdleDuration = 10 * 60 * 1000
  #defaultNextDuration = 3 * 60 * 1000
  #voiceLanguages = Object.keys(charword_table.voiceLangs["zh-CN"])
  #defaultVoiceLang = this.#voiceLanguages[0]
  #voiceLang = this.#defaultVoiceLang
  #subtitleLang = this.#defaultRegion
  #useSubtitle = false
  #useVoice = false
  #useVoiceActor = false
  #isPlaying = false
  #currentVoiceId = null
  #lastVoiceId = null
  #idleListener = -1
  #idleDuration = this.#defaultIdleDuration
  #nextListener = -1
  #nextDuration = this.#defaultNextDuration
  #lastClickToNext = false
  #voiceFolderObject = this.#getVoiceFolderObject()
  #voiceList = Object.keys(this.#getVoices())
  #defaultSubtitleX = 0
  #defaultSubtitleY = 0
  #subtitleX = this.#defaultSubtitleX
  #subtitleY = this.#defaultSubtitleY

  constructor(el, widgetEl) {
    this.#el = el
    this.#widgetEl = widgetEl
  }

  init() {
    this.#insertHTML()
    this.#audioEl = document.getElementById(this.#audioElId)
  }

  success() {
    const audioEndedFunc = () => {
      this.#isPlaying = false
      this.#setCurrentSubtitle(null)
      this.#lastClickToNext = false
    }
    this.#audioEl.addEventListener('ended', audioEndedFunc)
    this.#playEntryVoice()
    this.#initNextVoiceTimer()
    this.#widgetEl.addEventListener('click', () => {
      this.#lastClickToNext = true
      this.#nextVoice()
    })
    document.addEventListener('mousemove', () => {
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
    this.#el.hidden = !show
  }

  get useSubtitle() {
    return this.#useSubtitle
  }

  /**
   * @param {boolean} show
   */
  set useVoice(show) {
    this.#useVoice = show
    this.#playEntryVoice()
    if (!show && this.#isPlaying) {
      this.#audioEl.pause()
    }
  }

  get useVoice() {
    return this.#useVoice
  }

  /**
   * @param {boolean} show
   */
  set useVoiceActor(show) {
    this.#useVoiceActor = show
    document.getElementById('voice_actor_box').hidden = !show
  }

  get useVoiceActor() {
    return this.#useVoiceActor
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
   * @param {int} x
   */
  set subtitleX(x) {
    this.#subtitleX = x
    this.#updateSubtitlePosition()
  }

  get subtitleX() {
    return this.#subtitleX
  }

  /**
   * @param {int} y
   */
  set subtitleY(y) {
    this.#subtitleY = y - 100
    this.#updateSubtitlePosition()
  }

  get subtitleY() {
    return this.#subtitleY + 100
  }

  #updateSubtitlePosition() {
    window.settings.elementPosition(this.#el, this.#subtitleX, this.#subtitleY)
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
      this.#nextDuration = duration * 60 * 1000
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
    const voiceId = () => {
      const id = this.#voiceList[Math.floor((Math.random() * this.#voiceList.length))]
      return id === this.#lastVoiceId ? voiceId() : id
    }
    this.#playVoice(voiceId())
  }

  #playEntryVoice() {
    this.#playSpecialVoice("问候")
  }

  #setCurrentSubtitle(id) {
    if (id === null) {
      setTimeout(() => {
        if (this.#isPlaying) return
        this.#el.style.opacity = 0
      }, 5 * 1000);
      return
    }
    const subtitle = this.#getSubtitleById(id)
    const title = subtitle.title
    const content = subtitle.text
    const cvInfo = charword_table.voiceLangs[this.subtitleLanguage][this.#voiceLang]
    document.getElementById('voice_title').innerText = title
    document.getElementById('voice_subtitle').innerText = content
    this.#el.style.opacity = 1
    document.getElementById('voice_actor_name').innerText = cvInfo.join('')
  }

  #playVoice(id) {
    if (!this.useVoice) return
    this.#lastVoiceId = this.#currentVoiceId
    this.#currentVoiceId = id
    this.#audioEl.src = `./assets/${this.#getVoiceFoler()
      }/${id}.ogg`
    let startPlayPromise = this.#audioEl.play()
    if (startPlayPromise !== undefined) {
      startPlayPromise
        .then(() => {
          this.#isPlaying = true
          this.#setCurrentSubtitle(id)
        })
        .catch(() => {
          return
        })
    }
  }

  #playSpecialVoice(matcher) {
    const voices = this.#getVoices()
    const voiceId = Object.keys(voices).find(e => voices[e].title === matcher)
    this.#playVoice(voiceId)
  }

  #getVoiceFoler() {
    const folderObject = this.#voiceFolderObject
    return `${folderObject.main}/${folderObject.sub.find(e => e.lang === this.#voiceLang).name}`
  }

  #getVoices() {
    return charword_table.subtitleLangs[this.#subtitleLang].default
  }

  #getSubtitleById(id) {
    const obj = charword_table.subtitleLangs[this.#subtitleLang]
    let key = 'default'
    if (obj[this.#voiceLang]) {
      key = this.#voiceLang
    }
    return obj[key][id]
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

  #getSubtitleLanguages() {
    return Object.keys(charword_table.subtitleLangs)
  }

  #insertHTML() {
    this.#el.innerHTML = `
      <audio id="${this.#audioElId}" autoplay>
        <source type="audio/ogg" />
      </audio>
      <div class="voice-wrapper" id="voice_wrapper">
        <div class="voice-title" id="voice_title"></div>
        <div class="voice-subtitle">
          <div id="voice_subtitle"></div>
          <div class="voice-triangle"></div>
        </div>
      </div>
      <div id="voice_actor_box" hidden>
        <div class="voice-actor">
          <span class="voice-actor-icon"></span>
          <span id="voice_actor_name" class="voice-actor-name"></span>
        </div>
      </div>
    `
  }
}