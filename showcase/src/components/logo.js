import {
  insertHTMLChild,
  updateElementPosition,
  readFile,
  showRelatedHTML,
  syncHTMLValue,
} from "@/components/helper";
import "@/components/logo.css"

export default class Logo {
  #el = document.createElement("div")
  #imageEl
  #parentEl
  #default = {
    location: `${import.meta.env.BASE_URL}assets/`,
    image: `${import.meta.env.VITE_LOGO_FILENAME}.png`,
    useInvertFilter: import.meta.env.VITE_INVERT_FILTER === "true",
    ratio: 61.8,
    opacity: 30,
    hidden: false,
    position: {
      x: 0,
      y: 0,
    }
  }
  #config = {
    hidden: this.#default.hidden,
    ratio: this.#default.ratio,
    opacity: this.#default.opacity,
    position: {...this.#default.position}
  }

  init(el) {
    this.#parentEl = el
    this.#el.id = "logo-box"
    this.#el.innerHTML = `
      <img src="${this.#default.location + this.#default.image}" id="logo" alt="operator logo" />
    `
    insertHTMLChild(this.#parentEl, this.#el)
    this.#imageEl = document.getElementById("logo")
    this.#setInvertFilter(this.#default.useInvertFilter)
    this.opacity = this.#default.opacity
    this.#updateSizeOnWindowResize()
  }

  #updateSizeOnWindowResize() {
    const _this = this
    const resize = () => {
      _this.#resize(_this)
    }
    window.addEventListener("resize", resize, true);
    resize()
  }

  setImage(src, invertFilter = false) {
    this.#imageEl.src = src
    this.#resize()
    this.#setInvertFilter(invertFilter)
  }

  set image(v) {
    const update = (url) => {
      this.setImage(url, false)
      document.getElementById("logo-image-clear").disabled = false
    }
    if (typeof v === "object") {
      readFile(
        v,
        (blobURL) => update(blobURL)
      )
    } else {
      update(v)
    }
  }

  #resize(_this, value) {
    _this = _this || this
    _this.#imageEl.width = window.innerWidth / 2 * (value || _this.ratio) / 100
    updateElementPosition(_this.#imageEl, _this.#config.position)
  }

  #setInvertFilter(v) {
    if (!v) {
      this.#imageEl.style.filter = "invert(0)"
    } else {
      this.#imageEl.style.filter = "invert(1)"
    }
  }

  get hidden() {
    return this.#config.hidden
  }

  set hidden(v) {
    this.#config.hidden = v
    this.#imageEl.hidden = v;
  }

  get ratio() {
    return this.#config.ratio
  }

  set ratio(v) {
    this.#config.ratio = v
    this.#resize(this, v)
  }

  get opacity() {
    return this.#config.opacity
  }

  set opacity(v) {
    this.#imageEl.style.opacity = v / 100
    this.#config.opacity = v
  }

  get x() {
    return this.position.x
  }

  set x(v) {
    this.position = {
      x: v
    }
  }

  get y() {
    return this.position.y
  }

  set y(v) {
    this.position = {
      y: v
    }
  }

  get position() {
    return this.#config.position
  }

  set position(v) {
    if (typeof v !== "object") return;
    if (typeof v.x !== "undefined") this.#config.position.x = v.x;
    if (typeof v.y !== "undefined") this.#config.position.y = v.y;
    this.#updateLogoPosition()
  }

  #updateLogoPosition() {
    updateElementPosition(this.#imageEl, this.#config.position)
  }

  logoPadding(key, value) {
    // Note: Back Compatibility
    switch (key) {
      case "x":
        this.position = {
          x: value
        }
        break;
      case "y":
        this.position = {
          y: value
        }
        break;
      default:
        this.position = value
        break;
    }
  }

  setLogoOpacity(v) {
    // Note: Back Compatibility
    this.opacity = v
  }

  setLogoRatio(value) {
    // Note: Back Compatibility
    this.ratio = value
  }

  setLogoDisplay(flag) {
    // Note: Back Compatibility
    this.hidden = flag;
  }

  setLogo(src, invertFilter) {
    // Note: Back Compatibility
    this.setImage(src, invertFilter)
  }

  setLogoImage(e) {
    // Note: Back Compatibility
    this.image = e.target.files[0]
  }

  resetPosition() {
    this.position = {...this.#default.position}
    document.getElementById("logo-position-x-slider").value = this.#default.position.x
    document.getElementById("logo-position-x-input").value = this.#default.position.x
    document.getElementById("logo-position-y-slider").value = this.#default.position.y
    document.getElementById("logo-position-y-input").value = this.#default.position.y
  }

  logoReset() {
    // Note: Back Compatibility
    this.resetPosition()
  }

  resetImage() {
    this.setImage(this.#default.location + this.#default.image, this.#default.useInvertFilter)
    document.getElementById("logo-image-clear").disabled = true
  }

  resetLogoImage() {
    // Note: Back Compatibility
    this.resetImage()
  }

  resetOpacity() {
    this.setLogoOpacity(this.#default.opacity)
    document.getElementById("logo-opacity-slider").value = this.#default.opacity
    document.getElementById("logo-opacity-input").value = this.#default.opacity
  }

  resetHidden() {
    this.hidden = this.#default.hidden
  }

  resetRatio() {
    this.ratio = this.#default.ratio
    document.getElementById("logo-ratio-slider").value = this.#default.ratio
    document.getElementById("logo-ratio-input").value = this.#default.ratio
  }

  reset() {
    this.resetPosition()
    this.resetImage()
    this.resetRatio()
    this.resetOpacity()
    this.resetHidden()
  }

  get HTML() {
    return `
      <label for="operator-logo">Operator Logo</label>
      <input type="checkbox" id="operator-logo" name="operator-logo" checked/>
      <div id="operator-logo-realted">
        <div>
          <label for="logo-image">Logo Image (Store Locally)</label>
          <input type="file" id="logo-image" accept="image/*"/>
          <button type="button" id="logo-image-clear" disabled>Clear</button>
        </div>
        <div>
          <label for="logo-ratio">Logo Ratio</label>
          <input type="range" min="0" max="100" step="0.1" id="logo-ratio-slider" value="${this.ratio}" />
          <input type="number" id="logo-ratio-input" name="logo-ratio" value="${this.ratio}" />
        </div>
        <div>
          <label for="logo-opacity">Logo Opacity</label>
          <input type="range" min="0" max="100" data-css-class="logo" step="1" id="logo-opacity-slider" value="${this.opacity}" />
          <input type="number" id="logo-opacity-input" name="logo-opacity" value="${this.opacity}" />
        </div>
        <div>
          <label for="logo-position-x">Logo X Position</label>
            <input type="range" min="0" max="100" id="logo-position-x-slider" value="${this.position.x}" />
            <input type="number" id="logo-position-x-input" name="logo-position-x" value="${this.position.x}" />
        </div>
        <div>
          <label for="logo-position-y">Logo Y Position</label>
          <input type="range" min="0" max="100" id="logo-position-y-slider" value="${this.position.y}" />
          <input type="number" id="logo-position-y-input" name="logo-position-y" value="${this.position.y}" />
        </div>
      </div>
    `
  }

  get listeners() {
    return [
      {
        event: "logo-set-hidden", handler: e => this.hidden = e.detail
      }, {
        event: "logo-set-ratio", handler: e => this.ratio = e.detail
      }, {
        event: "logo-set-opacity", handler: e => this.opacity = e.detail
      }, {
        event: "logo-set-image", handler: e => this.image = e.detail
      }, {
        event: "logo-reset-image", handler: () => this.resetImage()
      }, {
        event: "logo-set-position", handler: e => this.position = e.detail
      }, {
        id: "operator-logo", event: "click", handler: e => {
          showRelatedHTML(e.currentTarget, "operator-logo-realted");
          this.hidden = !e.currentTarget.checked;
        }
      }, {
        id: "logo-image", event: "change", handler: e => this.image = e.target.files[0]
      }, {
        id: "logo-image-clear", event: "click", handler: () => this.resetImage()
      }, {
        id: "logo-ratio-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "logo-ratio-input");
          this.ratio = e.currentTarget.value;
        }
      }, {
        id: "logo-ratio-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "logo-ratio-slider");
          this.ratio = e.currentTarget.value;
        }
      }, {
        id: "logo-opacity-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "logo-opacity-input");
          this.opacity = e.currentTarget.value;
        }
      }, {
        id: "logo-opacity-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "logo-opacity-slider");
          this.opacity = e.currentTarget.value;
        }
      }, {
        id: "logo-position-x-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "logo-position-x-input");
          this.position = {
            x: e.currentTarget.value
          }
        }
      }, {
        id: "logo-position-x-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "logo-position-x-slider");
          this.position = {
            x: e.currentTarget.value
          }
        }
      }, {
        id: "logo-position-y-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "logo-position-y-input");
          this.position = {
            y: e.currentTarget.value
          }
        }
      }, {
        id: "logo-position-y-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "logo-position-y-slider");
          this.position = {
            y: e.currentTarget.value
          }
        }
      },
    ]
  }
}