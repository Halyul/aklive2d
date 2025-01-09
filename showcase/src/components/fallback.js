import { insertHTMLChild } from "@/components/helper";
import '@/components/fallback.css'

export default class Fallback {
  #el = document.createElement("div")

  constructor(parentEl) {
    alert('WebGL is unavailable. Fallback image will be used.');
    const calculateScale = (width, height) => {
      return { x: window.innerWidth / width, y: window.innerHeight / height };
    }
    const fallback = () => {
      const el = document.getElementById("fallback-container")
      const scale = calculateScale(import.meta.env.VITE_IMAGE_WIDTH, import.meta.env.VITE_IMAGE_HEIGHT);
      el.style.width = "100%";
      el.style.height = import.meta.env.VITE_IMAGE_HEIGHT * (scale.x > scale.y ? scale.y : scale.x) + "px";
    }
    window.addEventListener('resize', fallback, true);
    this.#el.id = "fallback-box"
    this.#el.innerHTML = `
      <div id="fallback-container">
        <div id="fallback"
          style="background-image: url(./assets/${import.meta.env.VITE_FALLBACK_FILENAME}.png)"
        />
      </div>
    `
    insertHTMLChild(parentEl, this.#el)
    fallback();
  }
}