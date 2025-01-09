import '@/index.css'
import '@/libs/wallpaper_engine'
import AKLive2D from '@/components/aklive2d'

(() => {
    window.aklive2d = new AKLive2D(document.getElementById("app"))
})()
