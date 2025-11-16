import Background from '@/components/background'
import Events from '@/components/events'
import {
    addEventListeners,
    insertHTMLChild,
    updateElementPosition,
} from '@/components/helper'
import Insight from '@/components/insight'
import Logo from '@/components/logo'
import Music from '@/components/music'
import Player from '@/components/player'
import Voice from '@/components/voice'
import '@/components/aklive2d.css'

export default class AKLive2D {
    #el = document.createElement('div')
    #appEl
    #queries = new URLSearchParams(window.location.search)
    #voice
    #music
    #player
    #background
    #logo
    #configQ = []
    #isInited = false
    #isSelfInited = false
    #isAllInited = false
    #insight = new Insight()

    constructor(appEl) {
        console.log(
            'All resources are extracted from Arknights. Github: https://gura.ch/aklive2d-gh'
        )

        window.addEventListener('contextmenu', (e) => e.preventDefault())
        document.addEventListener('gesturestart', (e) => e.preventDefault())

        this.#appEl = appEl
        this.#logo = new Logo(this.#appEl)
        this.#background = new Background(this.#appEl)
        this.#voice = new Voice(this.#appEl)
        this.#music = new Music(this.#appEl)
        this.#player = new Player(this.#appEl)
        addEventListeners([
            {
                event: Events.Player.Ready.name,
                handler: () => this.#selfInited(),
            },
            {
                event: Events.RegisterConfig.name,
                handler: (e) => this.#registerConfig(e),
            },
        ])

        Promise.all(
            [
                this.#logo,
                this.#background,
                this.#voice,
                this.#music,
                this.#player,
            ].map(async (e) => e && (await e.init()))
        ).then(() => this.#allInited())
    }

    #registerConfig(e) {
        if (!this.#isInited) {
            this.#configQ.push(e.detail)
        } else {
            this.#applyConfig(e.detail)
        }
    }

    #applyConfig(config = null) {
        if (config) {
            let targetObj
            const target = config.target
            switch (target) {
                case 'player':
                    targetObj = this.#player
                    break
                case 'background':
                    targetObj = this.#background
                    break
                case 'logo':
                    targetObj = this.#logo
                    break
                case 'music':
                    targetObj = this.#music
                    break
                case 'voice':
                    targetObj = this.#voice
                    break
                default:
                    return
            }
            targetObj.applyConfig(config.key, config.value)
        } else {
            this.#configQ.map((e) => this.#applyConfig(e))
        }
        return
    }

    get voice() {
        return this.#voice
    }

    get music() {
        return this.#music
    }

    get player() {
        return this.#player
    }

    get background() {
        return this.#background
    }

    get logo() {
        return this.#logo
    }

    get events() {
        return Events
    }

    get config() {
        return {
            player: this.#player.config,
            background: this.#background.config,
            logo: this.#logo.config,
            music: this.#music.config,
            voice: this.#voice.config,
        }
    }

    get configStr() {
        return JSON.stringify(this.config, null)
    }

    open() {
        this.#el.hidden = false
    }

    close() {
        this.#el.hidden = true
    }

    reset() {
        this.#player.reset()
        this.#background.reset()
        this.#logo.reset()
        this.#voice.reset()
        this.#music.reset()
    }

    #allInited() {
        this.#isAllInited = true
        if (this.#isSelfInited) {
            this.#success()
        }
    }

    #selfInited() {
        this.#isSelfInited = true
        if (this.#isAllInited) {
            this.#success()
        }
    }

    #success() {
        this.#isInited = true
        this.#el.id = 'settings-box'
        this.#el.hidden = true
        this.#el.innerHTML = `
    <div>
      ${this.#logo.HTML}
      ${this.#background.HTML}
      ${this.#player.HTML}
      ${this.#music.HTML}
      ${this.#voice.HTML}
      <div>
        <button type="button" id="settings-reset">Reset</button>
        <button type="button" id="settings-close">Close</button>
        <button type="button" id="settings-to-directory">Back to Directory</button>
      </div>
    </div>
    `
        insertHTMLChild(this.#appEl, this.#el)
        addEventListeners([
            {
                id: 'settings-reset',
                event: 'click',
                handler: () => this.reset(),
            },
            {
                id: 'settings-close',
                event: 'click',
                handler: () => this.close(),
            },
            {
                id: 'settings-to-directory',
                event: 'click',
                handler: () => {
                    window.location.href = '/'
                },
            },
            ...this.#logo.listeners,
            ...this.#background.listeners,
            ...this.#player.listeners,
            ...this.#voice.listeners,
            ...this.#music.listeners,
            ...this.#insight.listeners,
        ])

        this.#music.link(this.#background)
        this.#voice.link(this.#player)
        this.#applyConfig()

        this.#player.success()
        this.#voice.success()
        this.#music.success()
        this.#insight.success()

        if (
            this.#queries.has('aklive2d') ||
            import.meta.env.MODE === 'development'
        ) {
            this.open()
        }
        this.#registerBackCompatibilityFns()
    }

    #registerBackCompatibilityFns() {
        const _this = this
        window.voice = _this.#voice
        window.music = _this.#music
        window.settings = {
            elementPosition: updateElementPosition,
            open: _this.open,
            close: _this.close,
            reset: _this.reset,
            ..._this.#player.backCompatibilityFns,
            ..._this.#logo.backCompatibilityFns,
            ..._this.#music.backCompatibilityFns,
            ..._this.#background.backCompatibilityFns,
        }
    }
}
