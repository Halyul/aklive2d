import '@/components/fallback.css'

export default function (el) {
    el.hidden = false;
    alert('WebGL is unavailable. Fallback image will be used.');
    const calculateScale = (width, height) => {
        return { x: window.innerWidth / width, y: window.innerHeight / height };
    }
    const fallback = () => {
        const scale = calculateScale(import.meta.env.VITE_IMAGE_WIDTH, import.meta.env.VITE_IMAGE_HEIGHT);
        el.style.width = import.meta.env.VITE_IMAGE_WIDTH * (scale.x > scale.y ? scale.y : scale.x) + "px";
        el.style.height = import.meta.env.VITE_IMAGE_HEIGHT * (scale.x > scale.y ? scale.y : scale.x) + "px";
    }
    fallback();
    window.addEventListener('resize', fallback, true);
}