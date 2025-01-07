import '@/components/settings.css'

export default class Settings {
  #el
  #logoEl
  #videoEl
  #defaultLogoImage
  #defaultRatio = 61.8
  #defaultOpacity = 30
  #defaulthideLogo = false
  #defaultBackgroundImage = getComputedStyle(document.body).backgroundImage
  #defaultInvertFilter = import.meta.env.VITE_INVERT_FILTER === "true"
  #defaultLogoX = 0
  #defaultLogoY = 0
  #ratio = this.#defaultRatio
  #opacity = this.#defaultOpacity
  #logoX = this.#defaultLogoX
  #logoY = this.#defaultLogoY
  #isInsightInited = false
  #doNotTrack = false

  constructor(el, logoEl) {
    this.isWallpaperEngine = false
    this.#el = el
    this.#logoEl = logoEl
    this.spinePlayer = null
    this.#defaultLogoImage = this.#logoEl.src
    this.#init()
  }

  #init() {
    const _this = this
    window.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("gesturestart", e => e.preventDefault());

    const resize = () => {
      _this.#resize(_this)
    }
    window.addEventListener("resize", resize, true);
    resize()
    this.#setLogoInvertFilter(this.#defaultInvertFilter)
    this.setLogoOpacity(this.#defaultOpacity)
    this.#videoEl = document.getElementById("video-src")
    this.#insertHTML()
  }

  success() {
    this.loadViewport()
    this.insight(false, false)
    if ((new URLSearchParams(window.location.search)).has("settings") || import.meta.env.MODE === 'development') {
      this.open()
    }
  }

  insight(isWallpaperEngine, doNotTrack) {
    this.isWallpaperEngine = isWallpaperEngine
    if (this.#isInsightInited || import.meta.env.MODE === 'development') return
    this.#isInsightInited = true
    this.#doNotTrack = doNotTrack
    if (this.#doNotTrack) return
    try {
      const config = {
        path: `/${import.meta.env.VITE_LINK}`
      }
      if (this.isWallpaperEngine) config.hostname = "file://wallpaperengine.local";
      window.counterscale = {
        q: [["set", "siteId", import.meta.env.VITE_INSIGHT_ID], ["trackPageview", config]],
      };
      window.counterscaleOnDemandTrack();
    } catch(e) {
      console.warn && console.warn(e.message)
    }
  }

  setLogoDisplay(flag) {
    this.#logoEl.hidden = flag;
  }

  #resize(_this, value) {
    _this = _this || this
    _this.#logoEl.width = window.innerWidth / 2 * (value || _this.#ratio) / 100
    _this.elementPosition(this.#logoEl, this.#logoX, this.#logoY)
  }

  #setLogoInvertFilter(flag) {
    if (!flag) {
      this.#logoEl.style.filter = "invert(0)"
    } else {
      this.#logoEl.style.filter = "invert(1)"
    }
  }

  setLogo(src, invert_filter) {
    this.#logoEl.src = src
    this.#resize()
    this.#setLogoInvertFilter(invert_filter)
  }

  #readFile(e, callback = () => { }) {
    const file = e.target.files[0]
    if (!file) return
    callback(URL.createObjectURL(file.slice()), file.type)
  }

  setLogoImage(e) {
    this.#readFile(
      e,
      (blobURL, type) => {
        this.setLogo(blobURL, false)
        document.getElementById("logo_image_clear").disabled = false
      }
    )
  }

  resetLogoImage() {
    this.setLogo(this.#defaultLogoImage, this.#defaultInvertFilter)
    document.getElementById("logo_image_clear").disabled = true
  }

  setLogoRatio(value) {
    this.#ratio = value
    this.#resize(this, value)
  }

  setLogoOpacity(value) {
    this.#logoEl.style.opacity = value / 100
    this.#opacity = value
  }

  setBackgoundImage(v) {
    document.body.style.backgroundImage = v
  }

  get currentBackground() {
    if (!document.getElementById("custom_background_clear").disabled) {
      return null
    }
    return this.#defaultBackgroundImage.replace(/^(url\(('|"))(.+)(\/)(.+.png)(('|")\))$/, '$5')
  }

  setDefaultBackground(e) {
    this.#defaultBackgroundImage = `url("${import.meta.env.BASE_URL}assets/${import.meta.env.VITE_BACKGROUND_FOLDER}/${e}")`
    if (document.getElementById("custom_background_clear").disabled && !document.body.style.backgroundImage.startsWith("url(\"file:")) {
      this.setBackgoundImage(this.#defaultBackgroundImage)
    }
  }

  setBackground(e) {
    this.#readFile(
      e,
      (blobURL, type) => {
        this.setBackgoundImage(`url("${blobURL}")`)
        document.getElementById("custom_background_clear").disabled = false
      }
    )
  }

  resetBackground() {
    document.getElementById("custom_background").value = ""
    document.getElementById("custom_background_clear").disabled = true
    this.setBackgoundImage(this.#defaultBackgroundImage)
  }

  elementPosition(el, x, y) {
    const computedStyle = getComputedStyle(el)
    const elWidth = computedStyle.width
    const elHeight = computedStyle.height
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const xRange = windowWidth - parseInt(elWidth)
    const yRange = windowHeight - parseInt(elHeight)
    const xpx = x * xRange / 100
    const ypx = y * yRange / 100
    el.style.transform = `translate(${xpx}px, ${ypx}px)`
  }

  logoPadding(key, value) {
    switch (key) {
      case "x":
        this.#logoX = value
        break;
      case "y":
        this.#logoY = value
        break;
      default:
        this.#logoX = value.x
        this.#logoY = value.y
        break;
    }
    this.elementPosition(this.#logoEl, this.#logoX, this.#logoY)
  }

  logoReset() {
    this.#logoX = this.#defaultLogoX
    this.#logoY = this.#defaultLogoY
    this.elementPosition(this.#logoEl, this.#logoX, this.#logoY)
    document.getElementById("logo_padding_x_slider").value = this.#defaultLogoX
    document.getElementById("logo_padding_x_input").value = this.#defaultLogoX
    document.getElementById("logo_padding_y_slider").value = this.#defaultLogoY
    document.getElementById("logo_padding_y_input").value = this.#defaultLogoY
  }

  open() {
    this.#el.hidden = false;
  }

  close() {
    this.#el.hidden = true;
  }

  reset() {
    this.positionReset()
    // this.scaleReset()
    this.setLogoRatio(this.#defaultRatio)
    document.getElementById("logo_ratio_slider").value = this.#defaultRatio
    document.getElementById("logo_ratio_input").value = this.#defaultRatio
    this.setLogoOpacity(this.#defaultOpacity)
    document.getElementById("logo_opacity_slider").value = this.#defaultOpacity
    document.getElementById("logo_opacity_input").value = this.#defaultOpacity
    this.resetLogoImage()
    this.logoReset()
    this.resetBackground()
    this.setLogoDisplay(this.#defaulthideLogo)
    // this.setFPS(this.#defaultFps)
    // document.getElementById("fps_slider").value = this.#defaultFps
    // document.getElementById("fps_input").value = this.#defaultFps
    this.spinePlayer.play()
  }

  setVideo(e) {
    this.#readFile(
      e,
      (blobURL, type) => {
        this.#videoEl.src = blobURL
        this.#videoEl.load()
        document.getElementById("custom_video_background_clear").disabled = false
      }
    )
  }

  setVideoVolume(value) {
    this.#videoEl.volume = value / 100
  }

  getVideoVolume() {
    return this.#videoEl.volume * 100
  }

  setVideoFromWE(url) {
    this.#videoEl.src = url
    this.#videoEl.load()
    document.getElementById("custom_video_background_clear").disabled = false
  }

  resetVideo() {
    this.#videoEl.src = ""
    document.getElementById("custom_video_background").value = ""
    document.getElementById("custom_video_background_clear").disabled = true
  }

  #insertHTML() {
    this.#el.innerHTML = `
      <div>
        <div>
          <label for="operator_logo">Operator Logo</label>
          <input type="checkbox" id="operator_logo" name="operator_logo" checked/>
          <div id="operator_logo_realted">
            <div>
              <label for="logo_image">Logo Image (Store Locally)</label>
              <input type="file" id="logo_image" accept="image/*"/>
              <button type="button" id="logo_image_clear" disabled>Clear</button>
            </div>
            <div>
              <label for="logo_ratio">Logo Ratio</label>
              <input type="range" min="0" max="100" step="0.1" id="logo_ratio_slider" value="${this.#ratio}" />
              <input type="number" id="logo_ratio_input" name="logo_ratio" value="${this.#ratio}" />
            </div>
            <div>
              <label for="logo_opacity">Logo Opacity</label>
              <input type="range" min="0" max="100" data-css-class="logo" step="1" id="logo_opacity_slider" value="${this.#opacity}" />
              <input type="number" id="logo_opacity_input" name="logo_opacity" value="${this.#opacity}" />
            </div>
            <div>
              <label for="logo_padding_x">Logo X Position</label>
                <input type="range" min="0" max="100" id="logo_padding_x_slider" value="${this.#logoX}" />
                <input type="number" id="logo_padding_x_input" name="logo_padding_x" value="${this.#logoX}" />
            </div>
            <div>
              <label for="logo_padding_y">Logo Y Position</label>
              <input type="range" min="0" max="100" id="logo_padding_y_slider" value="${this.#logoY}" />
              <input type="number" id="logo_padding_y_input" name="logo_padding_y" value="${this.#logoY}" />
            </div>
          </div>
        </div>
        <div>
          <div>
            <label for="default_background_select">Choose a default background:</label>
            <select name="default_backgrounds" id="default_background_select">
                ${this.#updateOptions(null, JSON.parse(import.meta.env.VITE_BACKGROUND_FILES))}
            </select>
          </div>
          <div>
            <label for="custom_background"> Custom Background (Store Locally)</label>
            <input type="file" id="custom_background" accept="image/*"/>
            <button type="button" disabled id="custom_background_clear" disabled>Clear</button>
          </div>
        </div>
        <div>
          <label for="video">Video</label>
          <input type="checkbox" id="video" name="video" />
          <div id="video_realted" hidden>
            <div>
              <label for="custom_video_background"> Custom Video Background (Store Locally)</label>
              <input type="file" id="custom_video_background" accept="video/*"/>
              <button type="button" disabled id="custom_video_background_clear" disabled>Clear</button>
            </div>
            <div>
              <label for="video_volume">Video Volume</label>
              <input type="range" min="0" max="100" step="1" id="video_volume_slider" value="${this.getVideoVolume()}" />
              <input type="number" id="video_volume_input"  min="0" max="100" step="1" name="video_volume" value="${this.getVideoVolume() }" />
            </div>
          </div>
        </div>
        <div>
          <button type="button" id="settings_reset">Reset</button>
          <button type="button" id="settings_close">Close</button>
          <button type="button" id="settings_to_directory">Back to Directory</button>
        </div>
      </div>
    `
    this.#addEventListeners()
  }

  #sync(source, targetID) {
    if (typeof source === "string") source = document.getElementById(source);
    document.getElementById(targetID).value = source.value;
  }

  #showRelated(e, relatedSettingsID, revert = false) {
    const eRelatedSettings = document.getElementById(relatedSettingsID)
    const checked = revert ? !e.checked : e.checked;
    if (checked) {
      eRelatedSettings.hidden = false;
    } else {
      eRelatedSettings.hidden = true;
    }
  }

  #updateOptions(id, array) {
    const e = document.getElementById(id);
    const value = array.map(item => `<option value="${item}">${item}</option>`)
    if (e) {
      e.innerHTML = value.join("");
    }
    return value
  }

  #addEventListeners() {
    const _this = this;
    const listeners = [
      {
        id: "operator_logo", event: "click", handler: e => {
          _this.#showRelated(e.currentTarget, "operator_logo_realted");
          _this.setLogoDisplay(!e.currentTarget.checked)
        }
      }, {
        id: "logo_image", event: "change", handler: e => _this.setLogoImage(e)
      }, {
        id: "logo_image_clear", event: "click", handler: () => _this.resetLogoImage()
      }, {
        id: "logo_ratio_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "logo_ratio_input");
          _this.setLogoRatio(e.currentTarget.value);
        }
      }, {
        id: "logo_ratio_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "logo_ratio_slider");
          _this.setLogoRatio(e.currentTarget.value);
        }
      }, {
        id: "logo_opacity_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "logo_opacity_input");
          _this.setLogoOpacity(e.currentTarget.value);
        }
      }, {
        id: "logo_opacity_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "logo_opacity_slider");
          _this.setLogoOpacity(e.currentTarget.value);
        }
      }, {
        id: "logo_padding_x_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "logo_padding_x_input");
          _this.logoPadding("x", e.currentTarget.value);
        }
      }, {
        id: "logo_padding_x_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "logo_padding_x_slider");
          _this.logoPadding("x", e.currentTarget.value);
        }
      }, {
        id: "logo_padding_y_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "logo_padding_y_input");
          _this.logoPadding("y", e.currentTarget.value);
        }
      }, {
        id: "logo_padding_y_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "logo_padding_y_slider");
          _this.logoPadding("y", e.currentTarget.value);
        }
      }, {
        id: "default_background_select", event: "change", handler: e => _this.setDefaultBackground(e.currentTarget.value)
      }, {
        id: "custom_background", event: "change", handler: e => _this.setBackground(e)
      }, {
        id: "custom_background_clear", event: "click", handler: () => _this.resetBackground()
      }, {
        id: "video", event: "click", handler: e => {
          _this.#showRelated(e.currentTarget, "video_realted");
          if (!e.currentTarget.checked) _this.resetVideo()
        }
      }, {
        id: "custom_video_background", event: "change", handler: e => _this.setVideo(e)
      }, {
        id: "custom_video_background_clear", event: "click", handler: () => _this.resetVideo()
      }, {
        id: "video_volume_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "video_volume_input");
          this.setVideoVolume(parseInt(e.currentTarget.value))
        }
      }, {
        id: "video_volume_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "video_volume_slider");
          this.setVideoVolume(parseInt(e.currentTarget.value))
        }
      }, {
        id: "settings_reset", event: "click", handler: () => _this.reset()
      }, {
        id: "settings_close", event: "click", handler: () => _this.close()
      }, {
        id: "settings_to_directory", event: "click", handler: () => {
          window.location.href = '/';
        }
      }
    ]

    listeners.forEach(listener => {
      document.getElementById(listener.id).addEventListener(listener.event, e => listener.handler(e))
    })
  }
}