import React, {
  useEffect,
  useRef,
} from "react"
import PropTypes from 'prop-types';

export default function VoiceElement({
  src,
  replay,
  handleAduioStateChange,
}) {
  const audioRef = useRef(null)

  useEffect(() => {
    if (src) {
      audioRef.current.src = src
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }, [src])

  useEffect(() => {
    if (replay) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }, [replay])

  return (
    <audio
      ref={audioRef}
      preload="auto"
      autoPlay
      onEnded={(e) => {
        if (handleAduioStateChange) handleAduioStateChange(e, 'ended')
      }}
      onPlay={(e) => {
        if (handleAduioStateChange) handleAduioStateChange(e, 'play')
      }}
      onPause={(e) => {
        if (handleAduioStateChange) handleAduioStateChange(e, 'pause')
      }}
    >
      <source type="audio/ogg" />
    </audio>
  )
}
VoiceElement.propTypes = {
  src: PropTypes.string,
  handleAduioStateChange: PropTypes.func,
  replay: PropTypes.bool,
}