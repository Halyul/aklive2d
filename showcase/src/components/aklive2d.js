import Voice from "@/components/voice";
import Fallback from "@/components/fallback";
import { isWebGLSupported } from "@/components/helper";

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
        if (isWebGLSupported) {
            this.#voice.init(this.#el, this.#widgetEl);
        } else {
            (new Fallback()).init(this.#widgetEl)
        }
        
    }

    #backCompatibility() {
        window.voice = this.#voice
    }
}