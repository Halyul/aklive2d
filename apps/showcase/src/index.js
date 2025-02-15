import '@/index.css'
import '@/components/wallpaper_engine'
import AKLive2D from '@/components/aklive2d'
;(() => {
    window.aklive2d = new AKLive2D(document.getElementById('app'))
})()
