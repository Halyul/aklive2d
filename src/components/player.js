import '@/libs/spine-player.css'
import spine from '@/libs/spine-player'
import assets from '!/assets.json'
import '@/components/player.css'

const showControls = (new URLSearchParams(window.location.search)).has("controls")
let resetTime = window.performance.now();
let isPlayingInteract = false;

export default function spinePlayer(el) {
  el.hidden = false
  return new spine.SpinePlayer(el, {
    skelUrl: `./assets/${import.meta.env.VITE_FILENAME}.skel`,
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
    showControls: showControls,
    touch: showControls,
    fps: 60,
    defaultMix: 0,
    success: function (widget) {
      if (widget.skeleton.data.animations.map(e => e.name).includes("Start") && window.settings.useStartAnimation) {
        widget.animationState.setAnimation(0, "Start", false, 0)
      }
      widget.animationState.addAnimation(0, "Idle", true, 0);
      widget.animationState.addListener({
        end: (e) => {
          if (e.animation.name == "Interact") {
            isPlayingInteract = false;
          }
        },
        complete: () => {
          if (window.performance.now() - resetTime >= 8 * 1000 && Math.random() < 0.3) {
            resetTime = window.performance.now();
            let entry = widget.animationState.setAnimation(0, "Special", false, 0);
            entry.mixDuration = 0.3;
            widget.animationState.addAnimation(0, "Idle", true, 0);
          }
        },
      });
      widget.canvas.onclick = function () {
        if (isPlayingInteract) {
          return;
        }
        isPlayingInteract = true;
        let entry = widget.animationState.setAnimation(0, "Interact", false, 0);
        entry.mixDuration = 0.3;
        widget.animationState.addAnimation(0, "Idle", true, 0);
      }
      window.voice.success()
      window.settings.success()
      window.music.success()
    },
  })
}