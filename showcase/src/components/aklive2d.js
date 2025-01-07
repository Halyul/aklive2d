import Voice from "@/components/voice";

export default class AKLive2D {
    #el
    #widgetEl
    #voice = new Voice()

    constructor(el, widgetEl) {
        this.#el = el
        this.#widgetEl = widgetEl
        this.#backCompatibility()
    }

    init() {
        this.#voice.init(this.#el, this.#widgetEl);
    }

    #backCompatibility() {
        window.voice = this.#voice
    }
}