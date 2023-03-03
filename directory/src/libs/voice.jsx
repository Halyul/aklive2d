import {
  useState,
  useEffect,
  useRef,
} from "react"
import { useCallback } from "react"
const audioEl = new Audio()

export default function useAudio() {
  const [isPlaying, _setIsPlaying] = useState(false)
  const isPlayingRef = useRef(isPlaying)
  const setIsPlaying = (data) => {
    isPlayingRef.current = data
    _setIsPlaying(data)
  }

  useEffect(() => {
    audioEl.addEventListener('ended', () => setIsPlaying(false))
    return () => {
      audioEl.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [])

  const play = useCallback(
    (
      link,
      options = {
        overwrite: false
      },
      callback = () => { }
    ) => {
      if (!options.overwrite && audioEl.src === (window.location.href.replace(/\/$/g, '') + link)) return
      audioEl.src = link
      let startPlayPromise = audioEl.play()
      if (startPlayPromise !== undefined) {
        setIsPlaying(true)
        startPlayPromise
          .then(() => {
            callback()
            return
          })
          .catch(() => {
            return
          })
      }
    }, [])

  const stop = useCallback(() => {
    audioEl.pause()
    setIsPlaying(false)
  }, [])

  const getSrc = useCallback(() => audioEl.src, [])

  return {
    play,
    stop,
    getSrc,
    isPlaying,
    isPlayingRef,
  }

}