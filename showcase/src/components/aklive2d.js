import Voice from "@/components/voice";
import Fallback from "@/components/fallback";
import Music from "@/components/music";
import Player from "@/components/player";
import Background from "@/components/background";
import Logo from "@/components/logo";
import Insight from "@/components/insight";
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
  #widgetEl
  #queries = new URLSearchParams(window.location.search)
  #voice = new Voice()
  #music = new Music()
  #player = new Player()
  #background = new Background()
  #logo = new Logo()
  #insight = new Insight()

  constructor(appEl, widgetEl) {
    document.title = import.meta.env.VITE_TITLE
    console.log("All resources are extracted from Arknights. Github: https://gura.ch/aklive2d-gh")

    window.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("gesturestart", e => e.preventDefault());

    this.#appEl = appEl
    this.#widgetEl = widgetEl
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
        event: "player-ready", handler: () => this.success()
      },
      ...this.#logo.listeners,
      ...this.#background.listeners,
      ...this.#player.listeners,
      ...this.#voice.listeners,
      ...this.#music.listeners,
      ...this.#insight.listeners,
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
    this.#voice.reset()
  }

  success() {
    this.#music.link(this.#background)
    this.#background.link(this.#music)
    this.#voice.success()
    this.#music.success()
    this.#insight.success()
    if (this.#queries.has("settings") || this.#queries.has("aklive2d") || import.meta.env.MODE === 'development') {
      this.open()
    }
    this.#backCompatibility()
  }

  #backCompatibility() {
    window.voice = this.#voice
    window.music = this.#music
    window.settings = {
      spinePlayer: this.#player.spine,
      setFPS: this.#player.setFPS,
      setLogoDisplay: this.#logo.setLogoDisplay,
      setLogo: this.#logo.setLogo,
      setLogoImage: this.#logo.setLogoImage,
      resetLogoImage: this.#logo.resetLogoImage,
      setLogoRatio: this.#logo.setLogoRatio,
      setLogoOpacity: this.#logo.setLogoOpacity,
      setBackgoundImage: this.#background.setBackgroundImage,
      currentBackground: this.#background.currentBackground,
      setDefaultBackground: this.#background.setDefaultBackground,
      setBackground: this.#background.setBackground,
      resetBackground: this.#background.resetBackground,
      loadViewport: this.#player.loadViewport,
      setScale: this.#player.setScale,
      scale: this.#player.scale,
      positionPadding: this.#player.positionPadding,
      positionReset: this.#player.positionReset,
      scaleReset: this.#player.scaleReset,
      elementPosition: updateElementPosition,
      logoPadding: this.#logo.logoPadding,
      logoReset: this.#logo.logoReset,
      useStartAnimation: this.#player.useStartAnimation,
      open: this.open,
      close: this.close,
      reset: this.reset,
      setMusicFromWE: this.#music.setMusicFromWE,
      setMusic: this.#music.setMusic,
      resetMusic: this.#music.resetMusic,
      setVideo: this.#background.setVideo,
      setVideoVolume: this.#background.setVideoVolume,
      getVideoVolume: this.#background.getVideoVolume,
      setVideoFromWE: this.#background.setVideoFromWE,
      resetVideo: this.#background.resetVideo
    }
  }
}