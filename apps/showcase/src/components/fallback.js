import { insertHTMLChild } from '@/components/helper'
import '@/components/fallback.css'
import buildConfig from '!/config.json'

export default class Fallback {
    #el = document.createElement('div')

    constructor(parentEl) {
        alert('WebGL is unavailable. Fallback image will be used.')
        const calculateScale = (width, height) => {
            return {
                x: window.innerWidth / width,
                y: window.innerHeight / height,
            }
        }
        const fallback = () => {
            const el = document.getElementById('fallback-container')
            const scale = calculateScale(
                buildConfig.image_width,
                buildConfig.image_height
            )
            el.style.width = '100%'
            el.style.height =
                buildConfig.image_height *
                    (scale.x > scale.y ? scale.y : scale.x) +
                'px'
        }
        window.addEventListener('resize', fallback, true)
        this.#el.id = 'fallback-box'
        this.#el.innerHTML = `
      <div id="fallback-container">
        <div id="fallback"
          style="background-image: url(${import.meta.env.BASE_URL}${buildConfig.default_assets_dir}${buildConfig.fallback_name}.png)"
        />
      </div>
    `
        insertHTMLChild(parentEl, this.#el)
        fallback()
    }
}
