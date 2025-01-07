import Voice from "@/components/voice";
import Fallback from "@/components/fallback";
import Music from "@/components/music";
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
    #voice = new Voice()
    #music = new Music()

    constructor(appEl, widgetEl) {
        document.title = import.meta.env.VITE_TITLE
        console.log("All resources are extracted from Arknights. Github: https://gura.ch/aklive2d-gh")

        this.#appEl = appEl
        this.#widgetEl = widgetEl
        this.#backCompatibility()
    }

    init() {
        if (isWebGLSupported) {
            this.#voice.init(this.#appEl, this.#widgetEl);
            this.#music.init(this.#appEl);
        } else {
            (new Fallback()).init(this.#widgetEl)
        }
        this.#el.id = "settings-box"
        this.#el.innerHTML = `
            ${this.#voice.HTML}
            ${this.#music.HTML}
        `
        insertHTMLChild(this.#appEl, this.#el)
        addEventListeners([
            ...this.#voice.listeners,
            ...this.#music.listeners,
        ])
    }

    #backCompatibility() {
        window.voice = this.#voice
        window.music = this.#music
    }
}