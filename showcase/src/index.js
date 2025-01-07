import '@/index.css'
import '@/libs/wallpaper_engine'
import Settings from '@/components/settings'
import AKLive2D from '@/components/aklive2d'

document.getElementById('app').innerHTML = `
  <img src="./assets/${import.meta.env.VITE_LOGO_FILENAME}.png" class="logo invert-filter" id="logo" alt="operator logo" />
  <div id="settings" hidden></div>
  <div id="video_background">
    <video autoplay loop disablepictureinpicture id="video-src" />
  </div>
  <div id="widget-wrapper">
    <div id="player" hidden></div>
  </div>
`
window.aklive2d = new AKLive2D(document.getElementById('app'), document.getElementById('widget-wrapper'))
window.aklive2d.init()
window.settings = new Settings(document.querySelector('#settings'), document.querySelector('#logo'))

import('@/components/player').then(({ default: spinePlayer }) => {
  window.settings.spinePlayer = spinePlayer(document.querySelector('#player'))
})
