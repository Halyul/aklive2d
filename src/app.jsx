import { useState, useEffect, useRef } from 'preact/hooks'
import '@/app.css'
import '@/libs/wallpaper_engine'
import check_web_gl from '@/libs/check_web_gl'
import Player from '@/components/player'
import Fallback from '@/components/fallback'
import Settings from '@/components/settings'

export function App() {
  const params = new URLSearchParams(window.location.search);
  const isSupportWebGL = check_web_gl()
  const logoRef = useRef(null);
  const [spinePlayer, setSpinePlayer] = useState(null);

  const [showControls, setShowControls] = useState(params.has("controls"));
  const [showSettings, setShowSettings] = useState(params.has("settings") || import.meta.env.MODE === 'development');

  useEffect(() => {
    document.title = import.meta.env.VITE_TITLE
    console.log("All resources are extracted from Arknights. Github: https://github.com/Halyul/aklive2d")
  }, []);

  return (
    <>
      <img src={`./assets/${import.meta.env.VITE_LOGO_FILENAME}.png `} class="logo invert-filter" id="logo" alt="operator logo" ref={logoRef} width={16} />
      <Settings
        spinePlayer={spinePlayer}
        setShowSettings={setShowSettings}
        hidden={!showSettings}
        logoEl={logoRef.current}
      />
      <div id="widget-wrapper">
        {
          !isSupportWebGL ? (
            <Fallback />
          ) : (
            <Player
              showControls={showControls}
              setSpinePlayer={setSpinePlayer}
            />
          )
        }
      </div>
    </>
  )
}
