import {
  insertHTMLNodeBefore,
  readFile,
  updateHTMLOptions,
  showRelatedHTML,
  syncHTMLValue,
} from "@/components/helper";
import "@/components/background.css"

export default class Background {
  #el = document.createElement("div")
  #parentEl
  #videoEl
  #default = {
    location: `${import.meta.env.BASE_URL}assets/${import.meta.env.VITE_BACKGROUND_FOLDER}/`,
    image: "operator_bg.png"
  }
  #config = {
    image: null
  }
  #musicObj

  init(el, widgetEl) {
    this.#parentEl = el
    this.#el.id = "background-box"
    this.image = this.#default.location + this.#default.image
    this.#el.innerHTML = `
      <video autoplay loop disablepictureinpicture id="video-src" />
    `
    insertHTMLNodeBefore(this.#parentEl, widgetEl, this.#el)
    this.#videoEl = document.getElementById("video-src")
  }

  set image(v) {
    this.#el.style.backgroundImage = `url("${v}")`
  }

  set video(v) {
    if (typeof v === "object") {
      readFile(
        v,
        (blobURL) => {
          this.#videoEl.src = blobURL
          this.#videoEl.load()
        }
      )
    } else {
      this.#videoEl.src = v
      this.#videoEl.load()
    }
    document.getElementById("custom-video-background-clear").disabled = false
  }

  get volume() {
    return this.#videoEl.volume * 100
  }

  set volume(v) {
    this.#videoEl.volume = v / 100
  }

  get current() {
    return this.#config.image || this.#default.image
  }

  set default(v) {
    this.#default.image = v
    if (!this.#config.image) {
      this.image = this.#default.location + this.#default.image
    }
  }

  set custom(v) {
    readFile(
      v,
      (blobURL) => {
        this.#config.image = v
        this.image = blobURL
        document.getElementById("custom-background-clear").disabled = false
      }
    )
  }

  setVideoFromWE(url) {
    // Note: Back Compatibility
    this.video = url
  }

  get currentBackground() {
    // Note: Back Compatibility
    return this.current
  }

  resetImage() {
    document.getElementById("custom-background").value = ""
    document.getElementById("custom-background-clear").disabled = true
    this.#config.image = null
    this.image = this.#default.location + this.#default.image
  }

  resetVideo() {
    this.#videoEl.src = ""
    document.getElementById("custom-video-background").value = ""
    document.getElementById("custom-video-background-clear").disabled = true
  }

  setBackgroundImage(v) {
    // Note: Back Compatibility
    this.image = v
  }

  setDefaultBackground(v) {
    // Note: Back Compatibility
    this.default = v
  }

  setBackground(v) {
    // Note: Back Compatibility
    this.custom = v
  }

  resetBackground() {
    // Note: Back Compatibility
    this.resetImage()
  }

  setVideo(e) {
    // Note: Back Compatibility
    this.video = e.target.files[0]
  }

  getVideoVolume() {
    // Note: Back Compatibility
    return this.volume
  }

  setVideoVolume(v) {
    // Note: Back Compatibility
    this.volume = v
  }

  reset() {
    this.resetImage()
    this.resetVideo()
  }

  link(musicObj) {
    this.#musicObj = musicObj
  }

  get HTML() {
    return `
    <div>
      <div>
        <label for="default-background-select">Choose a default background:</label>
        <select name="default-backgrounds" id="default-background-select">
            ${updateHTMLOptions(null, JSON.parse(import.meta.env.VITE_BACKGROUND_FILES))}
        </select>
      </div>
      <div>
        <label for="custom-background"> Custom Background (Store Locally)</label>
        <input type="file" id="custom-background" accept="image/*"/>
        <button type="button" disabled id="custom-background-clear" disabled>Clear</button>
      </div>
    </div>
    <div>
      <label for="video">Video</label>
      <input type="checkbox" id="video" name="video" />
      <div id="video-realted" hidden>
        <div>
          <label for="custom-video-background"> Custom Video Background (Store Locally)</label>
          <input type="file" id="custom-video-background" accept="video/*"/>
          <button type="button" disabled id="custom-video-background-clear" disabled>Clear</button>
        </div>
        <div>
          <label for="video-volume">Video Volume</label>
          <input type="range" min="0" max="100" step="1" id="video-volume-slider" value="${this.volume}" />
          <input type="number" id="video-volume-input"  min="0" max="100" step="1" name="video-volume" value="${this.volume}" />
        </div>
      </div>
    </div>
    `
  }

  get listeners() {
    return [
      {
        id: "default-background-select", event: "change", handler: e => {
          this.default = e.currentTarget.value
          this.#musicObj.music = e.currentTarget.value
        }
      }, {
        id: "custom-background", event: "change", handler: e => this.custom = e.target.files[0]
      }, {
        id: "custom-background-clear", event: "click", handler: () => this.resetImage()
      }, {
        id: "video", event: "click", handler: e => {
          showRelatedHTML(e.currentTarget, "video-realted");
          if (!e.currentTarget.checked) this.resetVideo()
        }
      }, {
        id: "custom-video-background", event: "change", handler: e => this.video = e.target.files[0]
      }, {
        id: "custom-video-background-clear", event: "click", handler: () => this.resetVideo()
      }, {
        id: "video-volume-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "video-volume-input");
          this.volume = parseInt(e.currentTarget.value)
        }
      }, {
        id: "video-volume-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "video-volume-slider");
          this.volume = parseInt(e.currentTarget.value)
        }
      }, 
    ]
  }
}