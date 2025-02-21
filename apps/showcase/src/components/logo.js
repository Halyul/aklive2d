import {
    insertHTMLChild,
    updateElementPosition,
    readFile,
    showRelatedHTML,
    syncHTMLValue,
} from '@/components/helper'
import '@/components/logo.css'
import buildConfig from '!/config.json'

export default class Logo {
    #el = document.createElement('div')
    #imageEl
    #parentEl
    #default = {
        location: `${import.meta.env.BASE_URL}assets/`,
        image: `${buildConfig.logo_filename}.png`,
        useInvertFilter: buildConfig.invert_filter === 'true',
        ratio: 61.8,
        opacity: 30,
        hidden: false,
        position: {
            x: 0,
            y: 0,
        },
    }
    #config = {
        hidden: this.#default.hidden,
        ratio: this.#default.ratio,
        opacity: this.#default.opacity,
        position: { ...this.#default.position },
        name: null,
    }

    constructor(el) {
        this.#parentEl = el
        this.#el.id = 'logo-box'
        this.#el.innerHTML = `
      <img src="${this.#default.location + this.#default.image}" id="logo" alt="operator logo" />
    `
        insertHTMLChild(this.#parentEl, this.#el)
    }

    async init() {
        this.#imageEl = document.getElementById('logo')
        this.#setInvertFilter(this.#default.useInvertFilter)
        this.opacity = this.#default.opacity
        this.#updateSizeOnWindowResize()
    }

    setImage(src, invertFilter = false) {
        this.#imageEl.src = src
        this.#resize()
        this.#setInvertFilter(invertFilter)
    }

    resetPosition() {
        this.position = { ...this.#default.position }
        document.getElementById('logo-position-x-slider').value =
            this.#default.position.x
        document.getElementById('logo-position-x-input').value =
            this.#default.position.x
        document.getElementById('logo-position-y-slider').value =
            this.#default.position.y
        document.getElementById('logo-position-y-input').value =
            this.#default.position.y
    }

    resetImage() {
        this.#config.name = null
        this.setImage(
            this.#default.location + this.#default.image,
            this.#default.useInvertFilter
        )
        document.getElementById('logo-image-clear').disabled = true
    }

    resetOpacity() {
        this.opacity = this.#default.opacity
        document.getElementById('logo-opacity-slider').value =
            this.#default.opacity
        document.getElementById('logo-opacity-input').value =
            this.#default.opacity
    }

    resetHidden() {
        this.hidden = this.#default.hidden
    }

    resetRatio() {
        this.ratio = this.#default.ratio
        document.getElementById('logo-ratio-slider').value = this.#default.ratio
        document.getElementById('logo-ratio-input').value = this.#default.ratio
    }

    reset() {
        this.resetPosition()
        this.resetImage()
        this.resetRatio()
        this.resetOpacity()
        this.resetHidden()
    }

    #resize(_this, value) {
        _this = _this || this
        _this.#imageEl.width =
            ((window.innerWidth / 2) * (value || _this.ratio)) / 100
        updateElementPosition(_this.#imageEl, _this.#config.position)
    }

    #setInvertFilter(v) {
        if (!v) {
            this.#imageEl.style.filter = 'invert(0)'
        } else {
            this.#imageEl.style.filter = 'invert(1)'
        }
    }

    #updateLogoPosition() {
        updateElementPosition(this.#imageEl, this.#config.position)
    }

    #updateSizeOnWindowResize() {
        const _this = this
        const resize = () => {
            _this.#resize(_this)
        }
        window.addEventListener('resize', resize, true)
        resize()
    }

    set image(v) {
        if (!v) {
            this.resetImage()
            return
        }
        const update = (url, v = null) => {
            this.#config.name = {
                isLocalFile: v !== null,
                value: v ? v.name : url,
            }
            this.setImage(url, false)
            document.getElementById('logo-image-clear').disabled = false
        }
        if (typeof v === 'object') {
            readFile(v, (blobURL) => update(blobURL, v))
        } else {
            update(v)
        }
    }

    get hidden() {
        return this.#config.hidden
    }

    set hidden(v) {
        this.#config.hidden = v
        this.#imageEl.hidden = v
    }

    get ratio() {
        return this.#config.ratio
    }

    set ratio(v) {
        v = parseInt(v)
        this.#config.ratio = v
        this.#resize(this, v)
    }

    get opacity() {
        return this.#config.opacity
    }

    set opacity(v) {
        v = parseInt(v)
        this.#imageEl.style.opacity = v / 100
        this.#config.opacity = v
    }

    get x() {
        return this.position.x
    }

    set x(v) {
        this.position = {
            x: v,
        }
    }

    get y() {
        return this.position.y
    }

    set y(v) {
        this.position = {
            y: v,
        }
    }

    get position() {
        return this.#config.position
    }

    set position(v) {
        if (typeof v !== 'object') return
        if (v.x) v.x = parseInt(v.x)
        if (v.y) v.y = parseInt(v.y)
        this.#config.position = { ...this.#config.position, ...v }
        this.#updateLogoPosition()
    }

    get backCompatibilityFns() {
        const _this = this
        return {
            setLogoDisplay: (v) => (_this.hidden = v),
            setLogo: _this.setImage,
            setLogoImage: (e) => (_this.image = e.target.files[0]),
            resetLogoImage: _this.resetImage,
            setLogoRatio: (v) => (_this.ratio = v),
            setLogoOpacity: (v) => (_this.opacity = v),
            logoPadding: (key, value) => {
                switch (key) {
                    case 'x':
                        this.position = {
                            x: value,
                        }
                        break
                    case 'y':
                        this.position = {
                            y: value,
                        }
                        break
                    default:
                        this.position = value
                        break
                }
            },
            logoReset: _this.resetPosition,
        }
    }

    get config() {
        return {
            ...this.#config,
        }
    }

    get HTML() {
        return `
      <label for="operator-logo">Operator Logo</label>
      <input type="checkbox" id="operator-logo" name="operator-logo" ${this.hidden ? '' : 'checked'}/>
      <div id="operator-logo-realted" ${this.hidden ? 'hidden' : ''}>
        <div>
          <label for="logo-image">Logo Image (Store Locally)</label>
          <input type="file" id="logo-image" accept="image/*"/>
          <button type="button" id="logo-image-clear" ${this.#config.name ? (this.#config.name.isLocalFile ? '' : 'disabled') : 'disabled'}>Clear</button>
        </div>
        <div>
          <label for="logo-image-url">Logo Image URL:</label>
          <input type="text" id="logo-image-url" name="logo-image-url" value="${this.#config.name ? this.#config.name.value : ''}">
          <button type="button" id="logo-image-url-apply">Apply</button>
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
                id: 'operator-logo',
                event: 'click',
                handler: (e) => {
                    showRelatedHTML(e.currentTarget, 'operator-logo-realted')
                    this.hidden = !e.currentTarget.checked
                },
            },
            {
                id: 'logo-image',
                event: 'change',
                handler: (e) => (this.image = e.target.files[0]),
            },
            {
                id: 'logo-image-clear',
                event: 'click',
                handler: () => this.resetImage(),
            },
            {
                id: 'logo-image-url-apply',
                event: 'click',
                handler: () =>
                    (this.image =
                        document.getElementById('logo-image-url').value),
            },
            {
                id: 'logo-ratio-slider',
                event: 'input',
                handler: (e) => {
                    syncHTMLValue(e.currentTarget, 'logo-ratio-input')
                    this.ratio = e.currentTarget.value
                },
            },
            {
                id: 'logo-ratio-input',
                event: 'change',
                handler: (e) => {
                    syncHTMLValue(e.currentTarget, 'logo-ratio-slider')
                    this.ratio = e.currentTarget.value
                },
            },
            {
                id: 'logo-opacity-slider',
                event: 'input',
                handler: (e) => {
                    syncHTMLValue(e.currentTarget, 'logo-opacity-input')
                    this.opacity = e.currentTarget.value
                },
            },
            {
                id: 'logo-opacity-input',
                event: 'change',
                handler: (e) => {
                    syncHTMLValue(e.currentTarget, 'logo-opacity-slider')
                    this.opacity = e.currentTarget.value
                },
            },
            {
                id: 'logo-position-x-slider',
                event: 'input',
                handler: (e) => {
                    syncHTMLValue(e.currentTarget, 'logo-position-x-input')
                    this.position = {
                        x: e.currentTarget.value,
                    }
                },
            },
            {
                id: 'logo-position-x-input',
                event: 'change',
                handler: (e) => {
                    syncHTMLValue(e.currentTarget, 'logo-position-x-slider')
                    this.position = {
                        x: e.currentTarget.value,
                    }
                },
            },
            {
                id: 'logo-position-y-slider',
                event: 'input',
                handler: (e) => {
                    syncHTMLValue(e.currentTarget, 'logo-position-y-input')
                    this.position = {
                        y: e.currentTarget.value,
                    }
                },
            },
            {
                id: 'logo-position-y-input',
                event: 'change',
                handler: (e) => {
                    syncHTMLValue(e.currentTarget, 'logo-position-y-slider')
                    this.position = {
                        y: e.currentTarget.value,
                    }
                },
            },
        ]
    }

    applyConfig(key, value) {
        switch (key) {
            case 'hidden':
                this.hidden = value
                break
            case 'ratio':
                this.ratio = value
                break
            case 'opacity':
                this.opacity = value
                break
            case 'image':
                this.image = value
                break
            case 'position':
                this.position = value
                break
            default:
                return
        }
    }
}
