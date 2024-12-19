import '@/components/settings.css'

const getPercentage = (value) => parseInt(value.replace("%", ""))

export default class Settings {
  #el
  #logoEl
  #videoEl
  #defaultLogoImage
  #defaultFps = 60
  #defaultRatio = 61.8
  #defaultOpacity = 30
  #defaulthideLogo = false
  #defaultBackgroundImage = getComputedStyle(document.body).backgroundImage
  #defaultInvertFilter = import.meta.env.VITE_INVERT_FILTER === "true"
  #defaultPadLeft = getPercentage(`${import.meta.env.VITE_VIEWPORT_LEFT}%`)
  #defaultPadRight = getPercentage(`${import.meta.env.VITE_VIEWPORT_RIGHT}%`)
  #defaultPadTop = getPercentage(`${import.meta.env.VITE_VIEWPORT_TOP}%`)
  #defaultPadBottom = getPercentage(`${import.meta.env.VITE_VIEWPORT_BOTTOM}%`)
  #defaultScale = 1
  #defaultLogoX = 0
  #defaultLogoY = 0
  #defaultViewport = {
    debugRender: false,
    padLeft: `${this.#defaultPadLeft}%`,
    padRight: `${this.#defaultPadRight}%`,
    padTop: `${this.#defaultPadTop}%`,
    padBottom: `${this.#defaultPadBottom}%`,
    x: 0,
    y: 0,
  }
  #fps = this.#defaultFps
  #ratio = this.#defaultRatio
  #opacity = this.#defaultOpacity
  #padLeft = this.#defaultPadLeft
  #padRight = this.#defaultPadRight
  #padTop = this.#defaultPadTop
  #padBottom = this.#defaultPadBottom
  #scale = this.#defaultScale
  #logoX = this.#defaultLogoX
  #logoY = this.#defaultLogoY
  #isInsightInited = false
  #doNotTrack = false
  #useStartAnimation = true

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
    this.#updateOptions("animation_selection", this.spinePlayer.skeleton.data.animations.map(e => e.name))
    if ((new URLSearchParams(window.location.search)).has("settings") || import.meta.env.MODE === 'development') {
      this.open()
    }
  }

  insight(isWallpaperEngine, doNotTrack) {
    console.log(1)
    this.isWallpaperEngine = isWallpaperEngine
    if (this.#isInsightInited || import.meta.env.MODE === 'development') return
    console.log(2)
    this.#isInsightInited = true
    this.#doNotTrack = doNotTrack
    if (this.#doNotTrack) return
    console.log(3)
    try {
      window.counterscale = {
        q: [["set", "siteId", `aklive2d-${import.meta.env.VITE_LINK}`], ["trackPageview"]],
      };
      console.log(4)
      window.counterscaleOnDemandTrack();
      console.log(5)
    } catch(e) {
      console.warn && console.warn(e.message)
    }
  }

  setFPS(value) {
    this.#fps = value
    this.spinePlayer.setFps(value)
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

  loadViewport() {
    this.spinePlayer.updateViewport({
      padLeft: `${this.#padLeft}%`,
      padRight: `${this.#padRight}%`,
      padTop: `${this.#padTop}%`,
      padBottom: `${this.#padBottom}%`,
    })
  }

  setScale(value) {
    this.#scale = value
  }

  get scale() {
    return 1 / this.#scale
  }

  positionPadding(key, value) {
    switch (key) {
      case "left":
        this.#padLeft = value
        break;
      case "right":
        this.#padRight = value
        break;
      case "top":
        this.#padTop = value
        break;
      case "bottom":
        this.#padBottom = value
        break;
      default:
        this.#padLeft = value.left
        this.#padRight = value.right
        this.#padTop = value.top
        this.#padBottom = value.bottom
        break;
    }
    this.loadViewport()
  }

  positionReset() {
    this.#padLeft = this.#defaultPadLeft
    this.#padRight = this.#defaultPadRight
    this.#padTop = this.#defaultPadTop
    this.#padBottom = this.#defaultPadBottom
    this.spinePlayer.updateViewport(this.#defaultViewport)
    document.getElementById("position_padding_left_slider").value = this.#defaultPadLeft
    document.getElementById("position_padding_left_input").value = this.#defaultPadLeft
    document.getElementById("position_padding_right_slider").value = this.#defaultPadRight
    document.getElementById("position_padding_right_input").value = this.#defaultPadRight
    document.getElementById("position_padding_top_slider").value = this.#defaultPadTop
    document.getElementById("position_padding_top_input").value = this.#defaultPadTop
    document.getElementById("position_padding_bottom_slider").value = this.#defaultPadBottom
    document.getElementById("position_padding_bottom_input").value = this.#defaultPadBottom
  }
  
  scaleReset() {
    this.#scale = this.#defaultScale
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

  set useStartAnimation(v) {
    this.#useStartAnimation = v
  }

  get useStartAnimation() {
    return this.#useStartAnimation
  }

  open() {
    this.#el.hidden = false;
  }

  close() {
    this.#el.hidden = true;
  }

  reset() {
    this.positionReset()
    this.scaleReset()
    this.setLogoRatio(this.#defaultRatio)
    document.getElementById("logo_ratio_slider").value = this.#defaultRatio
    document.getElementById("logo_ratio_input").value = this.#defaultRatio
    this.setLogoOpacity(this.#defaultOpacity)
    document.getElementById("logo_opacity_slider").value = this.#defaultOpacity
    document.getElementById("logo_opacity_input").value = this.#defaultOpacity
    this.resetLogoImage()
    this.logoReset()
    this.resetBackground()
    this.resetMusic()
    this.setLogoDisplay(this.#defaulthideLogo)
    this.setFPS(this.#defaultFps)
    document.getElementById("fps_slider").value = this.#defaultFps
    document.getElementById("fps_input").value = this.#defaultFps
    this.spinePlayer.play()
  }

  setMusicFromWE(url) {
    const type = url.split(".").pop()
    window.music.setMusic(url, type)
    document.getElementById("custom_music_clear").disabled = false
  }

  setMusic(e) {
    this.#readFile(
      e,
      (blobURL, type) => {
        window.music.setMusic(blobURL, type)
        document.getElementById("custom_music_clear").disabled = false
      }
    )
  }

  resetMusic() {
    document.getElementById("custom_music").value = ""
    document.getElementById("custom_music_clear").disabled = true
    window.music.resetMusic()
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
          <label for="fps">FPS</label>
          <input type="range" min="1" max="60" value="${this.#fps}" step="1" id="fps_slider"/>
          <input type="number" id="fps_input" min="1" max="60" name="fps" value="${this.#fps}" />
        </div>
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
          <label for="voice">Voice</label>
          <input type="checkbox" id="voice" name="voice"/>
          <div id="voice_realted" hidden>
            <div>
              <label for="voice_lang_select">Choose the language of voice:</label>
              <select name="voice_lang" id="voice_lang_select">
                ${this.#updateOptions("voice_lang_select", window.voice.languages)}
              </select>
            </div>
            <div>
              <label for="voice_idle_duration">Idle Duration (min)</label>
              <input type="number" id="voice_idle_duration_input" min="0" name="voice_idle_duration" value="${window.voice.idleDuration}" />
            </div>
            <div>
              <label for="voice_next_duration">Next Duration (min)</label>
              <input type="number" id="voice_next_duration_input" name="voice_next_duration" value="${window.voice.nextDuration}" />
            </div>
            <div>
              <label for="subtitle">Subtitle</label>
              <input type="checkbox" id="subtitle" name="subtitle"/>
              <div id="subtitle_realted" hidden>
                <div>
                  <label for="subtitle_lang_select">Choose the language of subtitle:</label>
                  <select name="subtitle_lang" id="subtitle_lang_select">
                    ${this.#updateOptions("subtitle_lang_select", window.voice.subtitleLanguages)}
                  </select>
                </div>
                <div>
                  <label for="subtitle_padding_x">Subtitle X Position</label>
                  <input type="range" min="0" max="100" id="subtitle_padding_x_slider" value="${window.voice.subtitleX}" />
                  <input type="number" id="subtitle_padding_x_input" name="subtitle_padding_x" value="${window.voice.subtitleX}" />
                </div>
                <div>
                  <label for="subtitle_padding_y">Subtitle Y Position</label>
                  <input type="range" min="0" max="100" id="subtitle_padding_y_slider" value="${window.voice.subtitleY}" />
                  <input type="number" id="subtitle_padding_y_input" name="subtitle_padding_y" value="${window.voice.subtitleY}" />
                </div>
                <div>
                  <label for="voice_actor">Voice Actor</label>
                  <input type="checkbox" id="voice_actor" name="voice_actor"/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <label for="music">Music</label>
          <input type="checkbox" id="music" name="music" />
          <div id="music_realted" hidden>
            <div>
              <label for="music_select">Choose theme music:</label>
              <select name="music_select" id="music_select">
                ${this.#updateOptions("music_select", window.music.music)}
              </select>
            </div>
            <div>
              <label for="custom_music"> Custom Music (Store Locally)</label>
              <input type="file" id="custom_music" accept="audio/*"/>
              <button type="button" disabled id="custom_music_clear" disabled>Clear</button>
            </div>
            <div>
              <label for="music_volume">Music Volume</label>
              <input type="range" min="0" max="100" step="1" id="music_volume_slider" value="${window.music.volume}" />
              <input type="number" id="music_volume_input"  min="0" max="100" step="1" name="music_volume" value="${window.music.volume}" />
            </div>
            <div>
              <label for="music_switch_offset">Music Swtich Offset</label>
              <input type="range" min="0" max="1" step="0.01" id="music_switch_offset_slider" value="${window.music.timeOffset}" />
              <input type="number" id="music_switch_offset_input"  min="0" max="1" step="0.01" name="music_switch_offset" value="${window.music.timeOffset}" />
            </div>
          </div>
        </div>
        <div>
          <label for="scale">Scale</label>
          <input type="range" min="0.1" max="10" step="0.1" id="scale_slider" value="${this.#scale}" />
          <input type="number" id="scale_input" name="scale" value="${this.#scale}" step="0.1"/>
        </div>
        <div>
          <label for="position">Position</label>
          <input type="checkbox" id="position" name="position" />
          <div id="position_realted" hidden>
            <div>
              <label for="position_padding_left">Padding Left</label>
              <input type="range" min="-100" max="100" id="position_padding_left_slider" value="${this.#padLeft}" />
              <input type="number" id="position_padding_left_input" name="position_padding_left" value="${this.#padLeft}" />
            </div>
            <div>
              <label for="position_padding_right">Padding Right</label>
              <input type="range" min="-100" max="100" id="position_padding_right_slider" value="${this.padRight}" />
              <input type="number" id="position_padding_right_input" name="position_padding_right" value="${this.#padRight}" />
            </div>
            <div>
              <label for="position_padding_top">Padding Top</label>
              <input type="range" min="-100" max="100" id="position_padding_top_slider" value="${this.#padTop}" />
              <input type="number" id="position_padding_top_input" name="position_padding_top" value="${this.#padTop}" />
            </div>
            <div>
              <label for="position_padding_bottom">Padding Bottom</label>
              <input type="range" min="-100" max="100" id="position_padding_bottom_slider" value="${this.#padBottom}" />
              <input type="number" id="position_padding_bottom_input" name="position_padding_bottom" value="${this.#padBottom}" />
            </div>
          </div>
        </div>
        <div>
          <label for="animation_select">Animation:</label>
          <select name="animation_select" id="animation_selection"></select>
        </div>
        <div>
          <label for="use_start_animation">Use Start Animation</label>
          <input type="checkbox" id="use_start_animation" name="use_start_animation" checked/>
        </div>
        <div>
          <button type="button" id="settings_play" disabled>Play</button>
          <button type="button" id="settings_pause">Pause</button>
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

  #getCurrentOptions(id, value) {
    const e = document.getElementById(id);
    const options = [...e]
    const toSelecteIndex = options.findIndex(i => options.find(o => o.value === value) === i)
    e.selectedIndex = toSelecteIndex;
  }

  #addEventListeners() {
    const _this = this;
    const listeners = [
      {
        id: "fps_slider", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "fps_input");
          _this.setFPS(e.currentTarget.value);
        }
      }, {
        id: "fps_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "fps_input");
        }
      }, {
        id: "fps_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "fps_slider");
          _this.setFPS(e.currentTarget.value);
        }
      }, {
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
        id: "voice", event: "click", handler: e => {
          _this.#showRelated(e.currentTarget, "voice_realted");
          window.voice.useVoice = e.currentTarget.checked;
        }
      }, {
        id: "voice_lang_select", event: "change", handler: e => {
          window.voice.language = e.currentTarget.value
          _this.#updateOptions("subtitle_lang_select", window.voice.subtitleLanguages)
          _this.#getCurrentOptions("subtitle_lang_select", window.voice.subtitleLanguage)
        }
      }, {
        id: "voice_idle_duration_input", event: "change", handler: e => {
          window.voice.idleDuration = parseInt(e.currentTarget.value)
        }
      }, {
        id: "voice_next_duration_input", event: "change", handler: e => {
          window.voice.nextDuration = parseInt(e.currentTarget.value)
        }
      }, {
        id: "subtitle", event: "click", handler: e => {
          _this.#showRelated(e.currentTarget, "subtitle_realted");
          window.voice.useSubtitle = e.currentTarget.checked;
        }
      }, {
        id: "subtitle_lang_select", event: "change", handler: e => window.voice.subtitleLanguage = e.currentTarget.value
      }, {
        id: "subtitle_padding_x_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "subtitle_padding_x_input");
          window.voice.subtitleX = e.currentTarget.value
        }
      }, {
        id: "subtitle_padding_x_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "subtitle_padding_x_slider");
          window.voice.subtitleX = e.currentTarget.value
        }
      }, {
        id: "subtitle_padding_y_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "subtitle_padding_y_input");
          window.voice.subtitleY = e.currentTarget.value
        }
      }, {
        id: "subtitle_padding_y_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "subtitle_padding_y_slider");
          window.voice.subtitleY = e.currentTarget.value
        }
      }, {
        id: "voice_actor", event: "click", handler: e => {
          window.voice.useVoiceActor = e.currentTarget.checked;
        }
      }, {
        id: "music", event: "click", handler: e => {
          _this.#showRelated(e.currentTarget, "music_realted");
          window.music.useMusic = e.currentTarget.checked;
          window.music.changeMusic(this.currentBackground)
        }
      }, {
        id: "music_select", event: "change", handler: e => window.music.changeMusic(e.currentTarget.value)
      }, {
        id: "custom_music", event: "change", handler: e => _this.setMusic(e)
      }, {
        id: "custom_music_clear", event: "click", handler: () => _this.resetMusic()
      }, {
        id: "music_volume_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "music_volume_input");
          window.music.volume = parseInt(e.currentTarget.value)
        }
      }, {
        id: "music_volume_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "music_volume_slider");
          window.music.volume = parseInt(e.currentTarget.value)
        }
      }, {
        id: "music_switch_offset_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "music_switch_offset_input");
          window.music.timeOffset = parseFloat(e.currentTarget.value)
        }
      }, {
        id: "music_switch_offset_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "music_switch_offset_slider");
          window.music.timeOffset = parseFloat(e.currentTarget.value)
        }
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
        id: "position", event: "click", handler: e => {
          _this.#showRelated(e.currentTarget, "position_realted");
          if (!e.currentTarget.checked) _this.positionReset();
        }
      }, {
        id: "scale_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "scale_input");
          _this.setScale(e.currentTarget.value);
        }
      }, {
        id: "scale_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "scale_slider");
          _this.setScale(e.currentTarget.value);
        }
      }, {
        id: "position_padding_left_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "position_padding_left_input");
          _this.positionPadding("left", e.currentTarget.value);
        }
      }, {
        id: "position_padding_left_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "position_padding_left_slider");
          _this.positionPadding("left", e.currentTarget.value);
        }
      }, {
        id: "position_padding_right_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "position_padding_right_input");
          _this.positionPadding("right", e.currentTarget.value);
        }
      }, {
        id: "position_padding_right_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "position_padding_right_slider");
          _this.positionPadding("right", e.currentTarget.value);
        }
      }, {
        id: "position_padding_top_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "position_padding_top_input");
          _this.positionPadding("top", e.currentTarget.value);
        }
      }, {
        id: "position_padding_top_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "position_padding_top_slider");
          _this.positionPadding("top", e.currentTarget.value);
        }
      }, {
        id: "position_padding_bottom_slider", event: "input", handler: e => {
          _this.#sync(e.currentTarget, "position_padding_bottom_input");
          _this.positionPadding("bottom", e.currentTarget.value);
        }
      }, {
        id: "position_padding_bottom_input", event: "change", handler: e => {
          _this.#sync(e.currentTarget, "position_padding_bottom_slider");
          _this.positionPadding("bottom", e.currentTarget.value);
        }
      }, {
        id: "settings_play", event: "click", handler: e => {
          this.spinePlayer.play();
          e.currentTarget.disabled = true;
          document.getElementById("settings_pause").disabled = false;
        }
      }, {
        id: "settings_pause", event: "click", handler: e => {
          this.spinePlayer.pause();
          e.currentTarget.disabled = true;
          document.getElementById("settings_play").disabled = false;
        }
      }, {
        id: "settings_reset", event: "click", handler: () => _this.reset()
      }, {
        id: "settings_close", event: "click", handler: () => _this.close()
      }, {
        id: "animation_selection", event: "change", handler: e => {
          this.spinePlayer.animationState.setAnimation(0, e.currentTarget.value, false, 0)
          this.spinePlayer.animationState.addAnimation(0, "Idle", true, 0);
        }
      }, {
        id: "use_start_animation", event: "click", handler: e => {
          this.#useStartAnimation = e.currentTarget.checked;
        }
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