import Voice from "@/components/voice";
import Fallback from "@/components/fallback";
import Music from "@/components/music";
import Player from "@/components/player";
import Background from "@/components/background";
import Logo from "@/components/logo";
import {
  isWebGLSupported,
  insertHTMLChild,
  addEventListeners
} from "@/components/helper";
import '@/components/aklive2d.css'

export default class AKLive2D {
  #el = document.createElement("div")
  #appEl
  #widgetEl
  #queries = new URLSearchParams(window.location.search)
  #voice = new Voice()
  #music = new Music()
  #player = new Player()
  #background = new Background()
  #logo = new Logo()

  constructor(appEl, widgetEl) {
    document.title = import.meta.env.VITE_TITLE
    console.log("All resources are extracted from Arknights. Github: https://gura.ch/aklive2d-gh")

    window.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("gesturestart", e => e.preventDefault());

    this.#appEl = appEl
    this.#widgetEl = widgetEl
    this.#backCompatibility()
  }

  init() {
    if (isWebGLSupported) {
      this.#logo.init(this.#appEl);
      this.#background.init(this.#appEl, this.#widgetEl);
      this.#voice.init(this.#appEl, this.#widgetEl);
      this.#music.init(this.#appEl);
      this.#player.init(this.#widgetEl, this);
    } else {
      (new Fallback()).init(this.#widgetEl)
    }
    this.#el.id = "settings-box"
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
        event: "player-ready", handler: () => this.success()
      },
      ...this.#logo.listeners,
      ...this.#background.listeners,
      ...this.#player.listeners,
      ...this.#voice.listeners,
      ...this.#music.listeners,
      {
        id: "settings-reset", event: "click", handler: () => this.reset()
      }, {
        id: "settings-close", event: "click", handler: () => this.close()
      }, {
        id: "settings-to-directory", event: "click", handler: () => {
          window.location.href = '/';
        }
      }
    ])
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
  }

  success() {
    this.#voice.success()
    this.#music.success()
    if (this.#queries.has("settings") || this.#queries.has("aklive2d") || import.meta.env.MODE === 'development') {
      this.open()
    }
  }

  #backCompatibility() {
    window.voice = this.#voice
    window.music = this.#music
    window.player = this.#player
  }
}