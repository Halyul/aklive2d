import '@/index.css'
import '@/libs/wallpaper_engine'
import check_web_gl from '@/libs/check_web_gl'
import Settings from '@/components/settings'
import AKLive2D from '@/components/aklive2d'
import Music from '@/components/music'

document.getElementById('app').innerHTML = `
  <img src="./assets/${import.meta.env.VITE_LOGO_FILENAME}.png" class="logo invert-filter" id="logo" alt="operator logo" />
  <div id="settings" hidden></div>
  <div id="music_box" hidden></div> 
  <div id="video_background">
    <video autoplay loop disablepictureinpicture id="video-src" />
  </div>
  <div id="widget-wrapper">
    <div id="player" hidden></div>
  </div>
`
window.aklive2d = new AKLive2D(document.getElementById('app'), document.getElementById('widget-wrapper'))
window.aklive2d.init()
window.music = new Music(document.querySelector('#music_box'))
window.settings = new Settings(document.querySelector('#settings'), document.querySelector('#logo'))
document.title = import.meta.env.VITE_TITLE
console.log("All resources are extracted from Arknights. Github: https://gura.ch/aklive2d-gh")

if (check_web_gl()) {
  import('@/components/player').then(({ default: spinePlayer }) => {
    window.settings.spinePlayer = spinePlayer(document.querySelector('#player'))
  })
}
