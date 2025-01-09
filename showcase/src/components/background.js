import {
  readFile,
  updateHTMLOptions,
  showRelatedHTML,
  syncHTMLValue,
  insertHTMLChild,
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
    video: {
      name: null,
      volume: 100,
    },
    useVideo: false,
    name: null
  }
  #musicObj

  constructor(el) {
    this.#parentEl = el
    this.#el.id = "background-box"
    this.image = this.#default.location + this.#default.image
    this.#el.innerHTML = `
      <video autoplay loop disablepictureinpicture id="video-src" />
    `
    insertHTMLChild(this.#parentEl, this.#el)
    this.#videoEl = document.getElementById("video-src")
  }

  resetImage() {
    document.getElementById("custom-background").value = ""
    document.getElementById("custom-background-clear").disabled = true
    this.#config.name = null
    this.image = this.#default.location + this.#default.image
  }

  resetVideo() {
    this.#config.video.name = null
    this.#videoEl.src = ""
    document.getElementById("custom-video-background").value = ""
    document.getElementById("custom-video-background-clear").disabled = true
  }

  reset() {
    this.resetImage()
    this.resetVideo()
  }

  link(musicObj) {
    this.#musicObj = musicObj
  }

  get useVideo() {
    return this.#config.useVideo
  }

  set useVideo(v) {
    this.#config.useVideo = v
  }

  set image(v) {
    this.#el.style.backgroundImage = `url("${v}")`
  }

  set video(v) {
    const update = (url, v = null) => {
      this.#config.video.name = {
        isLocalFile: v !== null,
        value: v ? v.name : url
      }
      this.#videoEl.src = url
      this.#videoEl.load()
      document.getElementById("custom-video-background-clear").disabled = false
    }
    if (typeof v === "object") {
      readFile(
        v,
        (blobURL) => update(blobURL, v)
      )
    } else {
      update(v)
    }
  }

  get volume() {
    return this.#config.video.volume
  }

  set volume(v) {
    v = parseInt(v)
    this.#config.video.volume = v
    this.#videoEl.volume = v / 100
  }

  get current() {
    return this.#config.name || this.#default.image
  }

  set default(v) {
    this.#default.image = v
    this.#musicObj.music = v
    this.image = this.#default.location + this.#default.image
  }

  set custom(v) {
    const update = (url, v = null) => {
      this.#config.name = {
        isLocalFile: v !== null,
        value: v ? v.name : url
      }
      this.image = url
      document.getElementById("custom-background-clear").disabled = false
    }
    if (typeof v === "object") {
      readFile(
        v,
        (blobURL) => update(blobURL, v)
      )
    } else {
      update(v)
    }
  }

  get config() {
    return {
      default: this.#default.image,
      ...this.#config
    }
  }

  get backCompatibilityFns() {
    const _this = this
    return {
      currentBackground: _this.current,
      setBackgoundImage: (v) => _this.image = v,
      setDefaultBackground: (v) => _this.default = v,
      setBackground: (v) => _this.custom = v,
      resetBackground: _this.resetImage,
      setVideo: (e) => _this.video = e.target.files[0],
      getVideoVolume: () => _this.volume,
      setVideoVolume: (v) => _this.volume = v,
      setVideoFromWE: (url) => _this.video = url,
      resetVideo: _this.resetVideo
    }
  }

  get HTML() {
    return `
    <div>
      <div>
        <label for="default-background-select">Choose a default background:</label>
        <select name="default-backgrounds" id="default-background-select">
            ${updateHTMLOptions(JSON.parse(import.meta.env.VITE_BACKGROUND_FILES))}
        </select>
      </div>
      <div>
        <label for="custom-background">Custom Background (Store Locally)</label>
        <input type="file" id="custom-background" accept="image/*"/>
        <button type="button" id="custom-background-clear" ${this.#config.name ? this.#config.name.isLocalFile ? "" : "disabled" : "disabled"}>Clear</button>
      </div>
      <div>
        <label for="custom-background-url">Custom Background URL:</label>
        <input type="text" id="custom-background-url" name="custom-background-url" value="${this.#config.name ? this.#config.name.value : ""}">
        <button type="button" id="custom-background-url-apply">Apply</button>
      </div>
    </div>
    <div>
      <label for="video">Video</label>
      <input type="checkbox" id="video" name="video" ${this.useVideo ? "checked" : ""}/>
      <div id="video-realted" ${this.useVideo ? "" : "hidden"}>
        <div>
          <label for="custom-video-background">Custom Video Background (Store Locally)</label>
          <input type="file" id="custom-video-background" accept="video/*"/>
          <button type="button" id="custom-video-background-clear" ${this.#config.video.name ? this.#config.video.name.isLocalFile ? "" : "disabled" : "disabled"}>Clear</button>
        </div>
        <div>
          <label for="custom-video-background-url">Custom Video Background URL:</label>
          <input type="text" id="custom-video-background-url" name="custom-video-background-url"  value="${this.#config.video.name ? this.#config.video.name.value : ""}">
          <button type="button" id="custom-video-background-url-apply">Apply</button>
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
        event: "background-set-default", handler: e => this.default = e.detail
      }, {
        event: "background-set-custom", handler: e => this.custom = e.detail
      }, {
        event: "background-set-video", handler: e => this.video = e.detail
      }, {
        event: "background-set-volume", handler: e => this.volume = e.detail
      }, {
        event: "background-reset-image", handler: () => this.resetImage()
      }, {
        event: "background-reset-video", handler: () => this.resetVideo()
      }, {
        id: "default-background-select", event: "change", handler: e => {
          this.default = e.currentTarget.value
        }
      }, {
        id: "custom-background", event: "change", handler: e => this.custom = e.target.files[0]
      }, {
        id: "custom-background-clear", event: "click", handler: () => this.resetImage()
      }, {
        id: "custom-background-url-apply", event: "click", handler: () => this.custom = document.getElementById("custom-background-url").value
      }, {
        id: "video", event: "click", handler: e => {
          showRelatedHTML(e.currentTarget, "video-realted");
          this.useVideo = e.currentTarget.checked
          if (!e.currentTarget.checked) this.resetVideo()
        }
      }, {
        id: "custom-video-background", event: "change", handler: e => this.video = e.target.files[0]
      }, {
        id: "custom-video-background-clear", event: "click", handler: () => this.resetVideo()
      }, {
        id: "custom-video-background-url-apply", event: "click", handler: () => this.video = document.getElementById("custom-video-background-url").value
      }, {
        id: "video-volume-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "video-volume-input");
          this.volume = e.currentTarget.value
        }
      }, {
        id: "video-volume-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "video-volume-slider");
          this.volume = e.currentTarget.value
        }
      }, 
    ]
  }
}