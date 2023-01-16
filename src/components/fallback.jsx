import { useRef, useEffect } from 'preact/hooks'
import '@/components/fallback.css'

export default function Fallback() {
    const fallbackRef = useRef(null)

    useEffect(() => {
        alert('WebGL is unavailable. Fallback image will be used.');
        const calculateScale = (width, height) => {
            return { x: window.innerWidth / width, y: window.innerHeight / height };
        }
        const fallback = () => {
            const scale = calculateScale(import.meta.env.VITE_IMAGE_WIDTH, import.meta.env.VITE_IMAGE_HEIGHT);
            fallbackRef.current.style.width = import.meta.env.VITE_IMAGE_WIDTH * (scale.x > scale.y ? scale.y : scale.x) + "px";
            fallbackRef.current.style.height = import.meta.env.VITE_IMAGE_HEIGHT * (scale.x > scale.y ? scale.y : scale.x) + "px";
        }
        fallback();
        window.addEventListener('resize', fallback, true);
        return () => window.removeEventListener('resize', fallback, true);
    }, [])

    return (
        <div id="fallback"
            style={{
                backgroundImage: `url(./assets/${import.meta.env.VITE_FALLBACK_FILENAME}.png)`,
            }}
            ref={fallbackRef}
        />
    )
}