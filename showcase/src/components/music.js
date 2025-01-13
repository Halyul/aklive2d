import {
  insertHTMLChild,
  updateHTMLOptions,
  showRelatedHTML,
  syncHTMLValue,
  readFile,
  getCurrentHTMLOptions,
  createCustomEvent,
} from "@/components/helper";

export default class Music {
  #el = document.createElement("div")
  #parentEl
  #audio = {
    intro: {
      id: "music-intro",
      el: null
    },
    loop: {
      id: "music-loop",
      el: null
    }
  }
  #music = {
    mapping: JSON.parse(import.meta.env.VITE_MUSIC_MAPPING),
    location: import.meta.env.VITE_MUSIC_FOLDER,
    current: null,
    isUsingCustom: false,
    list: []
  }
  #config = {
    useMusic: false,
    timeOffset: 0.3,
    volume: 50,
    name: null
  }
  #backgroundObj

  constructor(el) {
    this.#parentEl = el
    this.#el.id = "music-box"
    this.#el.innerHTML = `
      <audio id="${this.#audio.intro.id}" preload="auto">
        <source type="audio/ogg" />
      </audio>
      <audio id="${this.#audio.loop.id}" preload="auto">
        <source type="audio/ogg" />
      </audio>
    `
    insertHTMLChild(this.#parentEl, this.#el)
    this.#music.list = Object.keys(this.#music.mapping)
    this.#audio.intro.el = document.getElementById(this.#audio.intro.id)
    this.#audio.loop.el = document.getElementById(this.#audio.loop.id)
    this.#audio.intro.el.volume = this.#volume
    this.#audio.loop.el.volume = this.#volume
    this.#audio.intro.el.ontimeupdate = () => {
      if (this.#audio.intro.el.currentTime >= this.#audio.intro.el.duration - this.#config.timeOffset) {
        this.#audio.intro.el.pause()
        this.#audio.loop.el.currentTime = 0
        this.#audio.loop.el.volume = this.#volume
      }
    }
    this.#audio.loop.el.ontimeupdate = () => {
      if (this.#audio.loop.el.currentTime >= this.#audio.loop.el.duration - this.#config.timeOffset) {
        this.#audio.loop.el.currentTime = 0
        this.#audio.loop.el.play()
      }
    }
  }

  success() {
    if (this.#music.current === null) this.music = this.#backgroundObj.current
  }

  link(backgroundObj) {
    this.#backgroundObj = backgroundObj
  }

  reset() {
    document.getElementById("custom-music").value = ""
    document.getElementById("custom-music-clear").disabled = true
    this.#music.isUsingCustom = false
    this.#config.name = null
    if (this.#config.useMusic) {
      this.#playMusic()
    }
  }

  #setMusic(data, type) {
    this.#audio.loop.el.src = data
    this.#audio.loop.el.querySelector('source').type = type
    this.#music.isUsingCustom = true
    this.#playMusic()
  }

  #playMusic() {
    if (!this.#music.isUsingCustom) {
      const introOgg = this.#music.mapping[this.#music.current].intro
      const intro = `./assets/${this.#music.location}/${introOgg}`
      const loop = `./assets/${this.#music.location}/${this.#music.mapping[this.#music.current].loop}`
      this.#audio.loop.el.src = loop
      this.#audio.loop.el.querySelector('source').type = 'audio/ogg'
      if (introOgg) {
        this.#audio.intro.el.src = intro || loop
        this.#audio.intro.el.querySelector('source').type = 'audio/ogg'
        this.#audio.intro.el.play()
        this.#audio.loop.el.volume = 0
        this.#audio.loop.el.play()
      } else {
        this.#audio.loop.el.volume = this.#volume
        this.#audio.loop.el.play()
      }
    } else {
      this.#audio.intro.el.pause()
      this.#audio.loop.el.volume = this.#volume
      this.#audio.loop.el.play()
    }
  }

  #stopMusic() {
    this.#audio.intro.el.pause()
    this.#audio.loop.el.pause()
  }

  get timeOffset() {
    return this.#config.timeOffset
  }

  set timeOffset(value) {
    this.#config.timeOffset = value
  }

  get volume() {
    return this.#config.volume
  }

  get #volume() {
    return this.#config.volume / 100
  }

  set volume(value) {
    this.#config.volume = value
    this.#audio.intro.el.volume = this.#volume
    if (this.#audio.intro.el.paused) this.#audio.loop.el.volume = this.#volume
  }

  get musics() {
    return this.#music.list
  }

  get useMusic() {
    return this.#config.useMusic
  }

  set useMusic(value) {
    this.#config.useMusic = value
    if (value) {
      this.#playMusic()
    } else {
      this.#stopMusic()
    }
  }

  get music() {
    return this.#music.current
  }

  get isUsingCustom() {
    return this.#music.isUsingCustom
  }

  set music(name) {
    if (name !== null && name !== this.#music.current) {
      this.#music.current = name
      if (this.#config.useMusic && !this.#music.isUsingCustom) {
        this.#audio.loop.el.pause()
        this.#audio.intro.el.pause()
        this.#playMusic()
      }
      getCurrentHTMLOptions("music-select", name)
    }
  }

  set custom(url) {
    const update = (url, type, v = null) => {
      this.#config.name = {
        isLocalFile: v !== null,
        value: v ? v.name : url
      }
      this.#setMusic(url, type)
      document.getElementById("custom-music-clear").disabled = false
    }
    if (typeof url === "object") {
      readFile(
        url,
        (blobURL, type) => update(blobURL, type, url)
      )
    } else {
      update(url, url.split(".").pop())
    }
  }

  get currentMusic() {
    // Note: Back Compatibility
    return this.music
  }

  changeMusic(name) {
    // Note: Back Compatibility
    this.music = name
  }

  get backCompatibilityFns() {
    const _this = this
    return {
      setMusicFromWE: (url) => _this.custom = url,
      setMusic: (e) => _this.custom = e.target.files[0],
      resetMusic: _this.reset
    }
  }

  get config() {
    return {
      default: this.#music.current,
      ...this.#config
    }
  }

  get HTML() {
    return `
    <div>
      <label for="music">Music</label>
      <input type="checkbox" id="music" name="music" ${this.useMusic ? "checked" : ""}/>
      <div id="music-realted" ${this.useMusic ? "" : "hidden"}>
        <div>
          <label for="music-select">Choose theme music:</label>
          <select name="music-select" id="music-select">
            ${updateHTMLOptions(this.musics)}
          </select>
        </div>
        <div>
          <label for="custom-music">Custom Music (Store Locally)</label>
          <input type="file" id="custom-music" accept="audio/*"/>
          <button type="button" id="custom-music-clear" ${this.#config.name ? this.#config.name.isLocalFile ? "" : "disabled" : "disabled"}>Clear</button>
        </div>
        <div>
          <label for="custom-music-url">Custom Music URL:</label>
          <input type="text" id="custom-music-url" name="custom-music-url" value="${this.#config.name ? this.#config.name.value : ""}">
          <button type="button" id="custom-music-url-apply">Apply</button>
        </div>
        <div>
          <label for="music-volume">Music Volume</label>
          <input type="range" min="0" max="100" step="1" id="music-volume-slider" value="${this.volume}" />
          <input type="number" id="music-volume-input"  min="0" max="100" step="1" name="music-volume" value="${this.volume}" />
        </div>
        <div>
          <label for="music-switch-offset">Music Swtich Offset</label>
          <input type="range" min="0" max="1" step="0.01" id="music-switch-offset-slider" value="${this.timeOffset}" />
          <input type="number" id="music-switch-offset-input"  min="0" max="1" step="0.01" name="music-switch-offset" value="${this.timeOffset}" />
        </div>
      </div>
    </div>
    `
  }

  get listeners() {
    return [
      {
        event: Events.SetMusic.name, handler: e => this.music = e.detail
      }, {
        event: Events.SetUseMusic.name, handler: e => this.useMusic = e.detail
      }, {
        event: Events.SetVolume.name, handler: e => this.volume = e.detail
      }, {
        event: Events.SetCustom.name, handler: e => this.custom = e.detail
      }, {
        event: Events.Reset.name, handler: () => this.reset()
      }, {
        id: "music", event: "click", handler: e => {
          showRelatedHTML(e.currentTarget, "music-realted");
          this.useMusic = e.currentTarget.checked;
        }
      }, {
        id: "music-select", event: "change", handler: e => this.music = e.currentTarget.value
      }, {
        id: "custom-music", event: "change", handler: e => this.custom = e.target.files[0]
      }, {
        id: "custom-music-clear", event: "click", handler: () => this.reset()
      }, {
        id: "custom-music-url-apply", event: "click", handler: () => this.custom = document.getElementById("custom-music-url").value
      }, {
        id: "music-volume-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "music-volume-input");
          this.volume = parseInt(e.currentTarget.value)
        }
      }, {
        id: "music-volume-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "music-volume-slider");
          this.volume = parseInt(e.currentTarget.value)
        }
      }, {
        id: "music-switch-offset-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "music-switch-offset-input");
          this.timeOffset = parseFloat(e.currentTarget.value)
        }
      }, {
        id: "music-switch-offset-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "music-switch-offset-slider");
          this.timeOffset = parseFloat(e.currentTarget.value)
        }
      },
    ]
  }
}

export const Events = {
  SetMusic: createCustomEvent("music-set-music", true),
  SetUseMusic: createCustomEvent("music-set-usemusic", true),
  SetVolume: createCustomEvent("music-set-volume", true),
  SetCustom: createCustomEvent("music-set-custom", true),
  Reset: createCustomEvent("music-reset"),
}