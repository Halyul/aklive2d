import '@/index.css'
import '@/libs/wallpaper_engine'
import check_web_gl from '@/libs/check_web_gl'
import Settings from '@/components/settings'
import Voice from '@/components/voice'

document.querySelector('#app').innerHTML = `
  <img src="./assets/${import.meta.env.VITE_LOGO_FILENAME}.png" class="logo invert-filter" id="logo" alt="operator logo" />
  <div id="settings"></div>
  <div id="voice" hidden></div> 
  <div id="widget-wrapper">
    <div id="fallback"
      style="background-image: url(./assets/${import.meta.env.VITE_FALLBACK_FILENAME}.png)"
      hidden
    ></div> 
    <div id="player" hidden></div>
  </div>
`
window.voice = new Voice(document.querySelector('#voice'), document.querySelector('#widget-wrapper'))
window.voice.init()
window.settings = new Settings(document.querySelector('#settings'), document.querySelector('#logo'))
document.title = import.meta.env.VITE_TITLE
console.log("All resources are extracted from Arknights. Github: https://github.com/Halyul/aklive2d")

if (check_web_gl()) {
  import('@/components/player').then(({ default: spinePlayer }) => {
    window.settings.spinePlayer = spinePlayer(document.querySelector('#player'))
  })
} else {
  import('@/components/fallback').then(({ default: fallback }) => {
    fallback(document.querySelector('#fallback'))
  })
}
