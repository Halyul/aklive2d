import '@/components/settings.css'

const getPercentage = (value) => parseInt(value.replace("%", ""))

export default class Settings {
  #el
  #logoEl
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
  #hidden = !((new URLSearchParams(window.location.search)).has("settings") || import.meta.env.MODE === 'development')
  #fps = this.#defaultFps
  #ratio = this.#defaultRatio
  #opacity = this.#defaultOpacity
  #padLeft = this.#defaultPadLeft
  #padRight = this.#defaultPadRight
  #padTop = this.#defaultPadTop
  #padBottom = this.#defaultPadBottom
  #logoX = this.#defaultLogoX
  #logoY = this.#defaultLogoY

  constructor(el, logoEl) {
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

    this.#insertHTML()
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

  #readFile(e, onload, callback) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file);
    reader.onload = readerEvent => onload(readerEvent)
    callback()
  }

  setLogoImage(e) {
    this.#readFile(
      e,
      (readerEvent) => {
        const content = readerEvent.target.result;
        this.setLogo(content, false)
      },
      () => document.getElementById("logo_image_clear").disabled = false
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

  setDefaultBackground(e) {
    const backgroundURL = `url("${import.meta.env.BASE_URL}assets/${import.meta.env.VITE_BACKGROUND_FOLDER}/${e}")`
    if (document.getElementById("custom_background_clear").disabled && !document.body.style.backgroundImage.startsWith("url(\"file:")) {
      this.setBackgoundImage(backgroundURL)
    }
    this.#defaultBackgroundImage = backgroundURL
  }

  setBackground(e) {
    this.#readFile(
      e,
      (readerEvent) => {
        const content = readerEvent.target.result;
        this.setBackgoundImage(`url("${content}")`)
      },
      () => document.getElementById("custom_background_clear").disabled = false
    )
  }

  resetBackground() {
    this.setBackgoundImage(this.#defaultBackgroundImage)
    document.getElementById("custom_background").value = ""
    document.getElementById("custom_background_clear").disabled = true
  }

  loadViewport() {
    this.spinePlayer.updateViewport({
      padLeft: `${this.#padLeft}%`,
      padRight: `${this.#padRight}%`,
      padTop: `${this.#padTop}%`,
      padBottom: `${this.#padBottom}%`,
    })
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

  elementPosition(el, x, y) {
    const elWidth = getComputedStyle(el).width
    const elHeight = getComputedStyle(el).height
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
    this.setFPS(this.#defaultFps)
    document.getElementById("fps_slider").value = this.#defaultFps
    document.getElementById("fps_input").value = this.#defaultFps
    this.spinePlayer.play()
  }

  #insertHTML() {
    this.#el.innerHTML = `
      <div ${this.#hidden && "hidden"}>
        <div>
          <label for="fps">FPS</label>
          <input type="range" min="1" max="60" value="${this.#fps}" step="1" id="fps_slider"/>
          <input type="number" id="fps_input" min="1" max="60" name="fps" value="${this.#fps}" />
        </div>
        <div>
          <label for="operator_logo">Operator Logo</label>
          <input type="checkbox" id="operator_logo" name="operator_logo" checked data-checked="true"/>
          <div id="operator_logo_realted">
            <div>
              <label for="logo_image">Logo Image (Store Locally)</label>
              <input type="file" id="logo_image" />
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
                ${JSON.parse(import.meta.env.VITE_BACKGROUND_FILES).map((b) => {
                  return `<option value="${b}">${b}</option>`
                })}
            </select>
          </div>
          <div>
            <label for="custom_background"> Custom Background (Store Locally)</label>
            <input type="file" id="custom_background"/>
            <button type="button" disabled id="custom_background_clear" disabled>Clear</button>
          </div>
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
          <button type="button" id="settings_play" disabled>Play</button>
          <button type="button" id="settings_pause">Pause</button>
          <button type="button" id="settings_reset">Reset</button>
          <button type="button" id="settings_close">Close</button>
        </div>
      </div>
    `
    this.#addEventListeners()
  }

  #sync(source, targetID) {
    document.getElementById(targetID).value = source.value;
  }

  #showRelated(e, relatedSettingsID) {
    const eRelatedSettings = document.getElementById(relatedSettingsID)
    if (e.checked) {
      eRelatedSettings.hidden = false;
    } else {
      eRelatedSettings.hidden = true;
    }
  };

  #addEventListeners() {
    const _this = this;

    document.getElementById("fps_slider").addEventListener("change", e => {
      _this.#sync(e.currentTarget, "fps_input");
      _this.setFPS(e.currentTarget.value);
    })
    document.getElementById("fps_input").addEventListener("change", e => {
      _this.#sync(e.currentTarget, "fps_slider");
      _this.setFPS(e.currentTarget.value);
    })

    document.getElementById("operator_logo").addEventListener("click", e => {
      _this.#showRelated(e.currentTarget, "operator_logo_realted");
      _this.setLogoDisplay(!e.currentTarget.checked)
    })

    document.getElementById("logo_image").addEventListener("change", e => _this.setLogoImage(e))
    document.getElementById("logo_image_clear").addEventListener("click", e => this.resetLogoImage())

    document.getElementById("logo_ratio_slider").addEventListener("input", e => {
      _this.#sync(e.currentTarget, "logo_ratio_input");
      _this.setLogoRatio(e.currentTarget.value);
    })
    document.getElementById("logo_ratio_input").addEventListener("change", e => {
      _this.#sync(e.currentTarget, "logo_ratio_slider");
      _this.setLogoRatio(e.currentTarget.value);
    })

    document.getElementById("logo_opacity_slider").addEventListener("input", e => {
      _this.#sync(e.currentTarget, "logo_opacity_input");
      _this.setLogoOpacity(e.currentTarget.value);
    })
    document.getElementById("logo_opacity_input").addEventListener("change", e => {
      _this.#sync(e.currentTarget, "logo_opacity_slider");
      _this.setLogoOpacity(e.currentTarget.value);
    })

    document.getElementById("logo_padding_x_slider").addEventListener("input", e => {
      _this.#sync(e.currentTarget, "logo_padding_x_input");
      _this.logoPadding("x", e.currentTarget.value);
    })
    document.getElementById("logo_padding_x_input").addEventListener("change", e => {
      _this.#sync(e.currentTarget, "logo_padding_x_slider");
      _this.logoPadding("x", e.currentTarget.value);
    })

    document.getElementById("logo_padding_y_slider").addEventListener("input", e => {
      _this.#sync(e.currentTarget, "logo_padding_y_input");
      _this.logoPadding("y", e.currentTarget.value);
    })
    document.getElementById("logo_padding_y_input").addEventListener("change", e => {
      _this.#sync(e.currentTarget, "logo_padding_y_slider");
      _this.logoPadding("y", e.currentTarget.value);
    })

    document.getElementById('default_background_select').addEventListener("change", e => _this.setDefaultBackground(e.currentTarget.value))

    document.getElementById("custom_background").addEventListener("change", e => _this.setBackground(e))
    document.getElementById("custom_background_clear").addEventListener("click", e => _this.resetBackground())

    document.getElementById("position").addEventListener("click", e => {
      _this.#showRelated(e.currentTarget, "position_realted");
      if (!e.currentTarget.checked) _this.positionReset();
    })

    document.getElementById("position_padding_left_slider").addEventListener("input", e => {
      _this.#sync(e.currentTarget, "position_padding_left_input");
      _this.positionPadding("left", e.currentTarget.value);
    })
    document.getElementById("position_padding_left_input").addEventListener("change", e => {
      _this.#sync(e.currentTarget, "position_padding_left_slider");
      _this.positionPadding("left", e.currentTarget.value);
    })

    document.getElementById("position_padding_right_slider").addEventListener("input", e => {
      _this.#sync(e.currentTarget, "position_padding_right_input");
      _this.positionPadding("right", e.currentTarget.value);
    })
    document.getElementById("position_padding_right_input").addEventListener("change", e => {
      _this.#sync(e.currentTarget, "position_padding_right_slider");
      _this.positionPadding("right", e.currentTarget.value);
    })

    document.getElementById("position_padding_top_slider").addEventListener("input", e => {
      _this.#sync(e.currentTarget, "position_padding_top_input");
      _this.positionPadding("top", e.currentTarget.value);
    })
    document.getElementById("position_padding_top_input").addEventListener("change", e => {
      _this.#sync(e.currentTarget, "position_padding_top_slider");
      _this.positionPadding("top", e.currentTarget.value);
    })

    document.getElementById("position_padding_bottom_slider").addEventListener("input", e => {
      _this.#sync(e.currentTarget, "position_padding_bottom_input");
      _this.positionPadding("bottom", e.currentTarget.value);
    })
    document.getElementById("position_padding_bottom_input").addEventListener("change", e => {
      _this.#sync(e.currentTarget, "position_padding_bottom_slider");
      _this.positionPadding("bottom", e.currentTarget.value);
    })

    document.getElementById("settings_play").addEventListener("click", e => {
      this.spinePlayer.play();
      e.currentTarget.disabled = true;
      document.getElementById("settings_pause").disabled = false;
    })
    document.getElementById("settings_pause").addEventListener("click", e => {
      this.spinePlayer.pause();
      e.currentTarget.disabled = true;
      document.getElementById("settings_play").disabled = false;
    })
    document.getElementById("settings_reset").addEventListener("click", e => {
      _this.reset();
    })
    document.getElementById("settings_close").addEventListener("click", e => {
      _this.close();
    })
  }
}