import {
  insertHTMLChild,
  updateHTMLOptions,
  showRelatedHTML,
  syncHTMLValue
} from "@/components/helper";
import {
  PlayerReadyEvent
} from "@/components/event"
import '@/libs/spine-player.css'
import spine from '@/libs/spine-player'
import assets from '!/assets.json'
import '@/components/player.css'

export default class Player {
  #el = document.createElement("div")
  #parentEl
  #showControls = (new URLSearchParams(window.location.search)).has("controls")
  #resetTime = window.performance.now()
  #isPlayingInteract = false
  #spine
  #default = {
    fps: 60,
    padding: {
      left: parseInt(import.meta.env.VITE_VIEWPORT_LEFT),
      right: parseInt(import.meta.env.VITE_VIEWPORT_RIGHT),
      top: parseInt(import.meta.env.VITE_VIEWPORT_TOP),
      bottom: parseInt(import.meta.env.VITE_VIEWPORT_BOTTOM),
    },
    scale: 1,
  }
  #config = {
    fps: this.#default.fps,
    useStartAnimation: true,
    usePadding: false,
    padding: {
      ...this.#default.padding
    },
    scale: this.#default.scale
  }

  constructor(el) {
    this.#parentEl = el
    this.#el.id = "player-box"
    insertHTMLChild(this.#parentEl, this.#el)
    const _this = this
    const playerConfig = {
      atlasUrl: `./assets/${import.meta.env.VITE_FILENAME}.atlas`,
      rawDataURIs: assets,
      premultipliedAlpha: true,
      alpha: true,
      backgroundColor: "#00000000",
      viewport: {
        debugRender: false,
        padLeft: `${import.meta.env.VITE_VIEWPORT_LEFT}%`,
        padRight: `${import.meta.env.VITE_VIEWPORT_RIGHT}%`,
        padTop: `${import.meta.env.VITE_VIEWPORT_TOP}%`,
        padBottom: `${import.meta.env.VITE_VIEWPORT_BOTTOM}%`,
        x: 0,
        y: 0,
      },
      showControls: _this.#showControls,
      touch: _this.#showControls,
      fps: 60,
      defaultMix: 0,
      success: function (widget) {
        if (widget.skeleton.data.animations.map(e => e.name).includes("Start") && _this.useStartAnimation) {
          widget.animationState.setAnimation(0, "Start", false)
        }
        widget.animationState.addAnimation(0, "Idle", true, 0);
        widget.animationState.addListener({
          end: (e) => {
            if (e.animation.name == "Interact") {
              _this.#isPlayingInteract = false;
            }
          },
          complete: () => {
            if (window.performance.now() - _this.#resetTime >= 8 * 1000 && Math.random() < 0.3) {
              _this.#resetTime = window.performance.now();
              let entry = widget.animationState.setAnimation(0, "Special", false);
              entry.mixDuration = 0.3;
              widget.animationState.addAnimation(0, "Idle", true, 0);
            }
          },
        });
        widget.canvas.onclick = function () {
          if (_this.#isPlayingInteract) {
            return;
          }
          _this.#isPlayingInteract = true;
          let entry = widget.animationState.setAnimation(0, "Interact", false);
          entry.mixDuration = 0.3;
          widget.animationState.addAnimation(0, "Idle", true, 0);
        }
        document.dispatchEvent(PlayerReadyEvent);
      },
    }
    if (import.meta.env.VITE_USE_JSON === "true") {
      playerConfig.jsonUrl = `./assets/${import.meta.env.VITE_FILENAME}.json`
    } else {
      playerConfig.skelUrl = `./assets/${import.meta.env.VITE_FILENAME}.skel`
    }
    this.#spine = new spine.SpinePlayer(this.#el, playerConfig)
  }

  success() {
    this.#loadViewport()
    updateHTMLOptions(this.#spine.skeleton.data.animations.map(e => e.name), "animation-selection")
  }

  resetPadding() {
    this.padding = {...this.#default.padding}
    document.getElementById("position-padding-left-slider").value = this.#default.padding.left
    document.getElementById("position-padding-left-input").value = this.#default.padding.left
    document.getElementById("position-padding-right-slider").value = this.#default.padding.right
    document.getElementById("position-padding-right-input").value = this.#default.padding.right
    document.getElementById("position-padding-top-slider").value = this.#default.padding.top
    document.getElementById("position-padding-top-input").value = this.#default.padding.top
    document.getElementById("position-padding-bottom-slider").value = this.#default.padding.bottom
    document.getElementById("position-padding-bottom-input").value = this.#default.padding.bottom
  }

  resetScale() {
    this.scale = this.#default.scale
  }

  resetFPS() {
    this.fps = this.#default.fps
    document.getElementById("fps-slider").value = this.#default.fps
    document.getElementById("fps-input").value = this.#default.fps
  }

  reset() {
    this.resetFPS()
    this.resetPadding()
    this.resetScale()
    this.#spine.play()
  }

  #loadViewport() {
    this.#spine.updateViewport({
      padLeft: `${this.#config.padding.left}%`,
      padRight: `${this.#config.padding.right}%`,
      padTop: `${this.#config.padding.top}%`,
      padBottom: `${this.#config.padding.bottom}%`,
    })
  }

  get usePadding() {
    return this.#config.usePadding
  }

  set usePadding(v) {
    this.#config.usePadding = v
  }

  set useStartAnimation(v) {
    this.#config.useStartAnimation = v
  }

  get useStartAnimation() {
    return this.#config.useStartAnimation
  }

  get spine() {
    return this.#spine
  }

  set fps(v) {
    this.#config.fps = v
    this.#spine.setFps(v)
  }

  get fps() {
    return this.#config.fps
  }

  set scale(v) {
    this.#config.scale = 1 / v
    this.#spine.setOperatorScale(1 / v)
  }

  get scale() {
    return this.#config.scale
  }

  get node() {
    return this.#el
  }

  get padLeft() {
    return this.padding.left
  }

  set padLeft(v) {
    this.padding = {
      left: v
    }
  }

  get padRight() {
    return this.padding.right
  }

  set padRight(v) {
    this.padding = {
      right: v
    }
  }

  get padTop() {
    return this.padding.top
  }

  set padTop(v) {
    this.padding = {
      top: v
    }
  }

  get padBottom() {
    return this.padding.bottom
  }

  set padBottom(v) {
    this.padding = {
      bottom: v
    }
  }

  get padding() {
    return this.#config.padding
  }

  set padding(v) {
    if (typeof v !== "object") return;
    if (v.left) this.#config.padding.left = v.left;
    if (v.right) this.#config.padding.right = v.right ;
    if (v.top) this.#config.padding.top = v.top;
    if (v.bottom) this.#config.padding.bottom = v.bottom;
    this.#loadViewport()
  }

  get backCompatibilityFns() {
    const _this = this
    return {
      spinePlayer: _this.#spine,
      setFPS: (fps) => _this.fps = fps,
      loadViewport: _this.#loadViewport,
      setScale: (v) => this.scale = v,
      scale: _this.scale,
      positionPadding: (key, value) => {
        switch (key) {
          case "left":
            this.padding = {
              left: value
            }
            break;
          case "right":
            this.padding = {
              right: value
            }
            break;
          case "top":
            this.padding = {
              top: value
            }
            break;
          case "bottom":
            this.padding = {
              bottom: value
            }
            break;
          default:
            this.#config.padding = value
            break;
        }
      },
      positionReset: _this.resetPadding,
      scaleReset: _this.resetScale,
      useStartAnimation: _this.useStartAnimation
    }
  }

  get config() {
    return {...this.#config}
  }

  get HTML() {
    return `
    <div>
      <div>
        <label for="fps">FPS</label>
        <input type="range" min="1" max="60" value="${this.fps}" step="1" id="fps-slider"/>
        <input type="number" id="fps-input" min="1" max="60" name="fps" value="${this.fps}" />
      </div>
      <div>
        <label for="animation-select">Animation:</label>
        <select name="animation-select" id="animation-selection"></select>
      </div>
      <div>
        <label for="use-start-animation">Use Start Animation</label>
        <input type="checkbox" id="use-start-animation" name="use-start-animation" checked/>
      </div>
      <button type="button" id="player-play" disabled>Play</button>
      <button type="button" id="player-pause">Pause</button>
      <div>
        <label for="scale">Scale</label>
        <input type="range" min="0.1" max="10" step="0.1" id="scale-slider" value="${this.scale}" />
        <input type="number" id="scale-input" name="scale" value="${this.scale}" step="0.1"/>
      </div>
      <div>
        <label for="position">Position</label>
        <input type="checkbox" id="position" name="position" ${this.usePadding ? "checked" : ""}/>
        <div id="position-realted" ${this.usePadding ? "" : "hidden"}>
          <div>
            <label for="position-padding-left">Padding Left</label>
            <input type="range" min="-100" max="100" id="position-padding-left-slider" value="${this.padding.left}" />
            <input type="number" id="position-padding-left-input" name="position-padding-left" value="${this.padding.left}" />
          </div>
          <div>
            <label for="position-padding-right">Padding Right</label>
            <input type="range" min="-100" max="100" id="position-padding-right-slider" value="${this.padding.right}" />
            <input type="number" id="position-padding-right-input" name="position-padding-right" value="${this.padding.right}" />
          </div>
          <div>
            <label for="position-padding-top">Padding Top</label>
            <input type="range" min="-100" max="100" id="position-padding-top-slider" value="${this.padding.top}" />
            <input type="number" id="position-padding-top-input" name="position-padding-top" value="${this.padding.top}" />
          </div>
          <div>
            <label for="position-padding-bottom">Padding Bottom</label>
            <input type="range" min="-100" max="100" id="position-padding-bottom-slider" value="${this.padding.bottom}" />
            <input type="number" id="position-padding-bottom-input" name="position-padding-bottom" value="${this.padding.bottom}" />
          </div>
        </div>
      </div>
    </div>
    `
  }

  get listeners() {
    return [
      {
        event: "player-set-fps", handler: e => this.fps = e.detail
      }, {
        event: "player-set-scale", handler: e => this.scale = e.detail
      }, {
        event: "player-set-padding", handler: e => this.padding = e.detail
      }, {
        event: "player-reset-padding", handler: () => this.resetPadding()
      }, {
        event: "player-set-usestartanimation", handler: e => this.useStartAnimation = e.detail
      }, {
        id: "fps-slider", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "fps-input");
          this.fps = e.currentTarget.value;
        }
      }, {
        id: "fps-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "fps-input");
        }
      }, {
        id: "fps-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "fps-slider");
          this.fps = e.currentTarget.value;
        }
      }, {
        id: "animation-selection", event: "change", handler: e => {
          this.spine.animationState.setAnimation(0, e.currentTarget.value, false, 0)
          this.spine.animationState.addAnimation(0, "Idle", true, 0);
        }
      }, {
        id: "use-start-animation", event: "click", handler: e => {
          this.useStartAnimation = e.currentTarget.checked;
        }
      }, {
        id: "player-play", event: "click", handler: e => {
          this.spine.play();
          e.currentTarget.disabled = true;
          document.getElementById("player-pause").disabled = false;
        }
      }, {
        id: "player-pause", event: "click", handler: e => {
          this.spine.pause();
          e.currentTarget.disabled = true;
          document.getElementById("player-play").disabled = false;
        }
      }, {
        id: "scale-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "scale-input");
          this.scale = e.currentTarget.value;
        }
      }, {
        id: "scale-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "scale-slider");
          this.scale = e.currentTarget.value;
        }
      }, {
        id: "position", event: "click", handler: e => {
          showRelatedHTML(e.currentTarget, "position-realted");
          this.usePadding = e.currentTarget.checked;
          if (!e.currentTarget.checked) this.resetPadding();
        }
      }, {
        id: "position-padding-left-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "position-padding-left-input");
          this.padding = {
            left: e.currentTarget.value
          }
        }
      }, {
        id: "position-padding-left-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "position-padding-left-slider");
          this.padding = {
            left: e.currentTarget.value
          }
        }
      }, {
        id: "position-padding-right-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "position-padding-right-input");
          this.padding = {
            right: e.currentTarget.value
          }
        }
      }, {
        id: "position-padding-right-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "position-padding-right-slider");
          this.padding = {
            right: e.currentTarget.value
          }
        }
      }, {
        id: "position-padding-top-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "position-padding-top-input");
          this.padding = {
            top: e.currentTarget.value
          }
        }
      }, {
        id: "position-padding-top-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "position-padding-top-slider");
          this.padding = {
            top: e.currentTarget.value
          }
        }
      }, {
        id: "position-padding-bottom-slider", event: "input", handler: e => {
          syncHTMLValue(e.currentTarget, "position-padding-bottom-input");
          this.padding = {
            bottom: e.currentTarget.value
          }
        }
      }, {
        id: "position-padding-bottom-input", event: "change", handler: e => {
          syncHTMLValue(e.currentTarget, "position-padding-bottom-slider");
          this.padding = {
            bottom: e.currentTarget.value
          }
        }
      },
    ]
  }
}