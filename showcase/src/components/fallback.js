import { insertHTMLChild } from "@/components/helper";
import '@/components/fallback.css'

export default class Fallback {
    #el = document.createElement("div")

    init(parentEl) {
        alert('WebGL is unavailable. Fallback image will be used.');
        const calculateScale = (width, height) => {
            return { x: window.innerWidth / width, y: window.innerHeight / height };
        }
        const fallback = () => {
            const scale = calculateScale(import.meta.env.VITE_IMAGE_WIDTH, import.meta.env.VITE_IMAGE_HEIGHT);
            this.#el.style.width = import.meta.env.VITE_IMAGE_WIDTH * (scale.x > scale.y ? scale.y : scale.x) + "px";
            this.#el.style.height = import.meta.env.VITE_IMAGE_HEIGHT * (scale.x > scale.y ? scale.y : scale.x) + "px";
        }
        fallback();
        window.addEventListener('resize', fallback, true);
        this.#el.innerHTML = `
            <div id="fallback"
                style="background-image: url(./assets/${import.meta.env.VITE_FALLBACK_FILENAME}.png)"
            />
        `
        insertHTMLChild(parentEl, this.#el)
    }
}