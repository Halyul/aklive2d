import { useRef, useEffect } from 'preact/hooks'
import fallback from 'fallback'
import '@/components/fallback.css'

export default function Fallback() {
    const fallbackRef = useRef(null)

    useEffect(() => {
        alert('WebGL is unavailable. Fallback image will be used.');
        const calculateScale = (width, height) => {
            return { x: window.innerWidth / width, y: window.innerHeight / height };
        }
        const fallback = () => {
            const scale = calculateScale(2048, 2048);
            fallbackRef.current.style.width = 2048 * (scale.x > scale.y ? scale.y : scale.x) + "px";
            fallbackRef.current.style.height = 2048 * (scale.x > scale.y ? scale.y : scale.x) + "px";
        }
        fallback();
        window.addEventListener('resize', fallback, true);
        return () => window.removeEventListener('resize', fallback, true);
    }, [])

    return (
        <div id="fallback"
            style={{
                backgroundImage: `url(${fallback})`,
            }}
            ref={fallbackRef}
        />
    )
}