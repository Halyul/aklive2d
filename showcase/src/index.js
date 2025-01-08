import '@/index.css'
import '@/libs/wallpaper_engine'
import AKLive2D from '@/components/aklive2d'

document.getElementById('app').innerHTML = `
  <div id="widget-wrapper" />
`
window.aklive2d = new AKLive2D(document.getElementById('app'), document.getElementById('widget-wrapper'))
window.aklive2d.init()
