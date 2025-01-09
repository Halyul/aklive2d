import Voice from "@/components/voice";
import Fallback from "@/components/fallback";
import Music from "@/components/music";
import Player from "@/components/player";
import Background from "@/components/background";
import Logo from "@/components/logo";
import Insight from "@/components/insight";
import * as Event from "@/components/event";
import {
  isWebGLSupported,
  insertHTMLChild,
  addEventListeners,
  updateElementPosition,
} from "@/components/helper";
import '@/components/aklive2d.css'

export default class AKLive2D {
  #el = document.createElement("div")
  #appEl
  #queries = new URLSearchParams(window.location.search)
  #voice
  #music
  #player
  #background
  #logo
  #insight = new Insight()

  constructor(appEl) {
    document.title = import.meta.env.VITE_TITLE
    console.log("All resources are extracted from Arknights. Github: https://gura.ch/aklive2d-gh")

    window.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("gesturestart", e => e.preventDefault());

    this.#appEl = appEl
    this.#logo = new Logo(this.#appEl)
    this.#background = new Background(this.#appEl)
    this.#voice = new Voice(this.#appEl)
    this.#music = new Music(this.#appEl)
    if (isWebGLSupported()) {
      this.#player = new Player(this.#appEl)
    } else {
      new Fallback(this.#appEl)
    }

    this.#el.id = "settings-box"
    this.#el.hidden = true
    this.#el.innerHTML = `
    <div>
      ${this.#logo.HTML}
      ${this.#background.HTML}
      ${this.#player.HTML}
      ${this.#voice.HTML}
      ${this.#music.HTML}
      <div>
        <button type="button" id="settings-reset">Reset</button>
        <button type="button" id="settings-close">Close</button>
        <button type="button" id="settings-to-directory">Back to Directory</button>
      </div>
    </div>
    `
    insertHTMLChild(this.#appEl, this.#el)
    addEventListeners([
      {
        event: "player-ready", handler: () => this.#success()
      }, {
        id: "settings-reset", event: "click", handler: () => this.reset()
      }, {
        id: "settings-close", event: "click", handler: () => this.close()
      }, {
        id: "settings-to-directory", event: "click", handler: () => {
          window.location.href = '/';
        }
      },
      ...this.#logo.listeners,
      ...this.#background.listeners,
      ...this.#player.listeners,
      ...this.#voice.listeners,
      ...this.#music.listeners,
      ...this.#insight.listeners,
    ])
  }

  get voice() {
    return this.#voice
  }

  get music() {
    return this.#music
  }

  get player() {
    return this.#player
  }
  
  get background() {
    return this.#background
  }

  get logo() {
    return this.#logo
  }

  get events() {
    return Event
  }

  get config() {
    return {
      player: this.#player.config,
      background: this.#background.config,
      logo: this.#logo.config,
      music: this.#music.config,
      voice: this.#voice.config
    }
  }

  get configStr() {
    return JSON.stringify(this.config, null)
  }

  open() {
    this.#el.hidden = false;
  }

  close() {
    this.#el.hidden = true;
  }

  reset() {
    this.#player.reset()
    this.#background.reset()
    this.#logo.reset()
    this.#voice.reset()
    this.#music.reset()
  }

  #success() {
    this.#music.link(this.#background)
    this.#background.link(this.#music)
    this.#voice.link(this.#player)
    this.#player.success()
    this.#voice.success()
    this.#music.success()
    this.#insight.success()
    if (this.#queries.has("aklive2d") || import.meta.env.MODE === 'development') {
      this.open()
    }
    this.#registerBackCompatibilityFns()
  }

  #registerBackCompatibilityFns() {
    const _this = this
    window.voice = _this.#voice
    window.music = _this.#music
    window.settings = {
      elementPosition: updateElementPosition,
      open: _this.open,
      close: _this.close,
      reset: _this.reset,
      ..._this.#player.backCompatibilityFns,
      ..._this.#logo.backCompatibilityFns,
      ..._this.#music.backCompatibilityFns,
      ..._this.#background.backCompatibilityFns
    }
  }
}