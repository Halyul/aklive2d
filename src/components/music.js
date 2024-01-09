export default class Music {
  #el
  #mapping = JSON.parse(import.meta.env.VITE_MUSIC_MAPPING)
  #folder = import.meta.env.VITE_MUSIC_FOLDER
  #currentMusic = null
  #audioIntroEl
  #audioLoopEl
  #audioIntroElId = 'music-intro'
  #audioLoopElId = 'music-loop'
  #useMusic = false
  #timeOffset = 0.3
  #volume = 0.5
  #isUsingCustomMusic = false

  constructor(el) {
    this.#el = el
    this.#insertHTML()
    this.#audioIntroEl = document.getElementById(this.#audioIntroElId)
    this.#audioLoopEl = document.getElementById(this.#audioLoopElId)
    this.#audioIntroEl.volume = this.#volume
    this.#audioLoopEl.volume = this.#volume
    this.#audioIntroEl.ontimeupdate = () => {
      if (this.#audioIntroEl.currentTime >= this.#audioIntroEl.duration - this.#timeOffset) {
        this.#audioIntroEl.pause()
        this.#audioLoopEl.play()
      }
    }
    this.#audioLoopEl.ontimeupdate = () => {
      if (this.#audioLoopEl.currentTime >= this.#audioLoopEl.duration - this.#timeOffset) {
        this.#audioLoopEl.currentTime = 0
        this.#audioLoopEl.play()
      }
    }
  }

  get timeOffset() {
    return this.#timeOffset
  }

  set timeOffset(value) {
    this.#timeOffset = value
  }

  get volume() {
    return this.#volume * 100
  }

  set volume(value) {
    value = value / 100
    this.#volume = value
    this.#audioIntroEl.volume = value
    this.#audioLoopEl.volume = value
  }

  get music() {
    return Object.keys(this.#mapping)
  }

  get useMusic() {
    return this.#useMusic
  }

  get currentMusic() {
    return this.#currentMusic
  }

  /**
   * @param {bool} value
   */
  set useMusic(value) {
    this.#useMusic = value
    if (value) {
      this.#playMusic()
    } else {
      this.#stopMusic()
    }
  }

  success() {
    if (this.#currentMusic === null) this.changeMusic(window.settings.currentBackground)
  }

  changeMusic(name) {
    if (name !== this.#currentMusic && !this.#isUsingCustomMusic) {
      this.#currentMusic = name
      if (this.#useMusic) {
        this.#audioLoopEl.pause()
        this.#audioIntroEl.pause()
        this.#playMusic()
      }
    }
  }

  setMusic(data, type) {
    this.#audioLoopEl.src = data
    this.#audioLoopEl.querySelector('source').type = `audio/${type}`
    this.#isUsingCustomMusic = true
    this.#playMusic()
  }

  resetMusic() {
    this.#isUsingCustomMusic = false
    if (this.#useMusic) {
      this.#playMusic()
    }
  }

  #playMusic() {
    if (!this.#isUsingCustomMusic) {
      const introOgg = this.#mapping[this.#currentMusic].intro
      const intro = `./assets/${this.#folder}/${introOgg}`
      const loop = `./assets/${this.#folder}/${this.#mapping[this.#currentMusic].loop}`
      this.#audioLoopEl.src = loop
      this.#audioLoopEl.querySelector('source').type = 'audio/ogg'
      if (introOgg) {
        this.#audioIntroEl.src = intro || loop
        this.#audioIntroEl.querySelector('source').type = 'audio/ogg'
      } else {
        this.#audioLoopEl.play()
      }
    } else {
      this.#audioIntroEl.pause()
      this.#audioLoopEl.play()
    }
  }

  #stopMusic() {
    this.#audioIntroEl.pause()
    this.#audioLoopEl.pause()
  }

  #insertHTML() {
    this.#el.innerHTML = `
      <audio id="${this.#audioIntroElId}" preload="auto" autoplay>
        <source type="audio/ogg" />
      </audio>
      <audio id="${this.#audioLoopElId}" preload="auto">
        <source type="audio/ogg" />
      </audio>
    `
  }
}