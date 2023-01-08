import { useState, useEffect } from 'preact/hooks'
import '@/components/settings.css'
import { subscribe, unsubscribe, publish } from '@/libs/events'

const getPercentage = (value) => parseInt(value.replace("%", ""))
const defaultBackgroundImage = getComputedStyle(document.body).backgroundImage

export default function Settings({
  spinePlayer, setShowSettings, hidden, logoEl
}) {
  const defaultFps = 60
  const defaultRatio = 61.8
  const defaultOpacity = import.meta.env.VITE_OPACITY
  const defaultShowLogo = false
  const defaultInvertFilter = import.meta.env.VITE_INVERT_FILTER === "true"
  const [defaultLogoImage, setDefaultLogoImage] = useState(null)
  const defaultPadLeft = getPercentage(`${import.meta.env.VITE_VIEWPORT_LEFT}%`)
  const defaultPadRight = getPercentage(`${import.meta.env.VITE_VIEWPORT_RIGHT}%`)
  const defaultPadTop = getPercentage(`${import.meta.env.VITE_VIEWPORT_TOP}%`)
  const defaultPadBottom = getPercentage(`${import.meta.env.VITE_VIEWPORT_BOTTOM}%`)
  const defaultViewport = {
    debugRender: false,
    padLeft: `${defaultPadLeft}%`,
    padRight: `${defaultPadRight}%`,
    padTop: `${defaultPadTop}%`,
    padBottom: `${defaultPadBottom}%`,
    x: 0,
    y: 0,
  }

  const [fps, setFps] = useState(defaultFps)
  const [ratio, setRatio] = useState(defaultRatio)
  const [opacity, setOpacity] = useState(defaultOpacity)
  const [padLeft, setPadLeft] = useState(defaultPadLeft)
  const [padRight, setPadRight] = useState(defaultPadRight)
  const [padTop, setPadTop] = useState(defaultPadTop)
  const [padBottom, setPadBottom] = useState(defaultPadBottom)

  const [showLogo, setShowLogo] = useState(defaultShowLogo)
  const [hidePositionSettings, setHidePositionSettings] = useState(true)
  const [backgroundClearDisabled, setBackgroundClearDisabled] = useState(true)
  const [logoClearDisabled, setLogoClearDisabled] = useState(true)

  const [isPlaying, setIsPlaying] = useState(true)

  const resize = (value) => {
    logoEl.width = window.innerWidth / 2 * (value || ratio) / 100
  }

  const readFile = (e, onload, callback) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file);
    reader.onload = readerEvent => onload(readerEvent)
    callback()
  }

  const setFPS = (value) => {
    setFps(value)
    spinePlayer.setFps(value)
  }

  useEffect(() => {
    const handleListener = (e) => {
      setFPS(e.detail)
    }
    subscribe("settings:fps", handleListener)
    return () => unsubscribe("settings:fps", handleListener)
  }, [spinePlayer])

  const setLogoDisplay = (flag) => {
    setShowLogo(flag)
    logoEl.hidden = flag;
  }

  useEffect(() => {
    const handleListener = (e) => {
      setLogoDisplay(e.detail)
    }
    subscribe("settings:logo", handleListener)
    return () => unsubscribe("settings:logo", handleListener)
  }, [logoEl])

  const setLogo = (src, invert_filter) => {
    logoEl.src = src
    resize()
    setLogoInvertFilter(invert_filter)
  }

  const setLogoImage = (e) => {
    readFile(
      e,
      (readerEvent) => {
        const content = readerEvent.target.result;
        setLogo(content, false)
      },
      () => setLogoClearDisabled(false)
    )
  }

  useEffect(() => {
    const handleListener = (e) => {
      setLogo(e.detail)
    }
    subscribe("settings:image:set", handleListener)
    return () => unsubscribe("settings:image:set", handleListener)
  }, [logoEl])

  const resetLogoImage = () => {
    setLogo(defaultLogoImage, defaultInvertFilter)
    setLogoClearDisabled(true)
  }

  useEffect(() => {
    subscribe("settings:image:reset", resetLogoImage)
    return () => unsubscribe("settings:image:reset", resetLogoImage)
  }, [logoEl])

  const setLogoRatio = (value) => {
    setRatio(value)
    resize(value)
  }

  useEffect(() => {
    const handleListener = (e) => {
      setLogoRatio(e.detail)
    }
    subscribe("settings:ratio", handleListener)
    return () => unsubscribe("settings:ratio", handleListener)
  }, [logoEl])

  const setLogoOpacity = (value) => {
    setOpacity(value)
    logoEl.style.opacity = value / 100
  }

  useEffect(() => {
    const handleListener = (e) => {
      setLogoOpacity(e.detail)
    }
    subscribe("settings:opacity", handleListener)
    return () => unsubscribe("settings:opacity", handleListener)
  }, [logoEl])

  const setLogoInvertFilter = (flag) => {
    if (!flag) {
      logoEl.style.filter = "invert(0)"
    } else {
      logoEl.style.filter = "invert(1)"
    }
  }

  const setBackgoundImage = (v) => {
    document.body.style.backgroundImage = v
  }

  const setBackground = (e) => {
    readFile(
      e,
      (readerEvent) => {
        const content = readerEvent.target.result;
        setBackgoundImage(`url("${content}")`)
      },
      () => setBackgroundClearDisabled(false)
    )
  }

  useEffect(() => {
    const handleListener = (e) => {
      setBackgoundImage(e.detail)
    }
    subscribe("settings:background:set", handleListener)
    return () => unsubscribe("settings:background:set", handleListener)
  }, [])

  const resetBackground = () => {
    setBackgoundImage(defaultBackgroundImage)
    setBackgroundClearDisabled(true)
  }

  useEffect(() => {
    subscribe("settings:background:reset", resetLogoImage)
    return () => unsubscribe("settings:background:reset", resetLogoImage)
  }, [])

  const positionPadding = (key, value) => {
    switch (key) {
      case "left":
        setPadLeft(value)
        spinePlayer.updateViewport({
          ...defaultViewport,
          padLeft: `${value}%`,
        })
        break;
      case "right":
        setPadRight(value)
        spinePlayer.updateViewport({
          ...defaultViewport,
          padRight: `${value}%`,
        })
        break;
      case "top":
        setPadTop(value)
        spinePlayer.updateViewport({
          ...defaultViewport,
          padTop: `${value}%`,
        })
        break;
      case "bottom":
        setPadBottom(value)
        spinePlayer.updateViewport({
          ...defaultViewport,
          padBottom: `${value}%`,
        })
        break;
    }
  }

  useEffect(() => {
    const handleListener = (e) => {
      positionPadding(e.detail.key, e.detail.value)
    }
    subscribe("settings:position:set", handleListener)
    return () => unsubscribe("settings:position:set", handleListener)
  }, [spinePlayer])

  const positionReset = () => {
    setPadLeft(defaultPadLeft)
    setPadRight(defaultPadRight)
    setPadTop(defaultPadTop)
    setPadBottom(defaultPadBottom)
    spinePlayer.updateViewport(defaultViewport)
  }

  useEffect(() => {
    subscribe("settings:position:reset", positionReset)
    return () => unsubscribe("settings:position:reset", positionReset)
  }, [spinePlayer])

  useEffect(() => {
    if (logoEl) {
      resize()
      setLogoInvertFilter(defaultInvertFilter)
      setLogoOpacity(defaultOpacity)
      setDefaultLogoImage(logoEl.src)
    }
  }, [logoEl])

  useEffect(() => {
    window.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("gesturestart", e => e.preventDefault());
  }, [])

  useEffect(() => {
    window.addEventListener("resize", resize, true);
    return () => {
      window.removeEventListener("resize", resize, true);
    }
  }, [])

  return (
    <div class="website-settings" hidden={hidden}>
      <div>
        <label for="fps">FPS</label>
        <input type="range" min="1" max="60" value={fps} step="1"
          onChange={(e) => setFPS(e.target.value)}
        />
        <input type="number" id="fps_input" min="1" max="60" name="fps" value={fps}
          onChange={(e) => setFPS(e.target.value)}
        />
      </div>
      <div>
        <label for="operator_logo">Operator Logo</label>
        <input type="checkbox" name="operator_logo" checked={!showLogo} onClick={(e) => setLogoDisplay(!e.target.checked)} />
        <div hidden={showLogo}>
          <div>
            <label for="logo_image">Logo Image (Store Locally)</label>
            <input type="file" onChange={(e) => setLogoImage(e)} />
            <button type="button" disabled={logoClearDisabled} onClick={() => resetLogoImage()}>Clear</button>
          </div>
          <div>
            <label for="logo_ratio">Logo Ratio</label>
            <input type="range" min="0" max="100" step="0.1" value={ratio} onChange={(e) => setLogoRatio(e.target.value)} />
            <input type="number" name="logo_ratio" value={ratio} onChange={(e) => setLogoRatio(e.target.value)} />
          </div>
          <div>
            <label for="logo_opacity">Logo Opacity</label>
            <input type="range" min="0" max="100" step="1" id="logo_opacity_slider" value={opacity} onChange={(e) => setLogoOpacity(e.target.value)} />
            <input type="number" id="logo_opacity_input" name="logo_opacity" value={opacity} onOpacity={(e) => setLogoOpacity(e.target.value)} />
          </div>
        </div>
      </div>
      <div>
        <label for="background_image">Background Image (Store Locally)</label>
        <input type="file" onChange={(e) => setBackground(e)} />
        <button type="button" disabled={backgroundClearDisabled} onClick={() => resetBackground()}>Clear</button>
      </div>
      <div>
        <label for="position">Position</label>
        <input type="checkbox" name="position" checked={!hidePositionSettings} onClick={(e) => setHidePositionSettings(!e.target.checked)} />
        <div hidden={hidePositionSettings}>
          <div>
            <label for="position_padding_left">Padding Left</label>
            <input type="range" min="-100" max="100" value={padLeft} onChange={(e) => positionPadding("left", e.target.value)} />
            <input type="number" name="position_padding_left" value={padLeft} onChange={(e) => positionPadding("left", e.target.value)} />
          </div>
          <div>
            <label for="position_padding_right">Padding Right</label>
            <input type="range" min="-100" max="100" value={padRight} onChange={(e) => positionPadding("right", e.target.value)} />
            <input type="number" name="position_padding_right" value={padRight} onChange={(e) => positionPadding("right", e.target.value)} />
          </div>
          <div>
            <label for="position_padding_top">Padding Top</label>
            <input type="range" min="-100" max="100" value={padTop} onChange={(e) => positionPadding("top", e.target.value)} />
            <input type="number" name="position_padding_top" value={padTop} onChange={(e) => positionPadding("top", e.target.value)} />
          </div>
          <div>
            <label for="position_padding_bottom">Padding Bottom</label>
            <input type="range" min="-100" max="100" value={padBottom} onChange={(e) => positionPadding("bottom", e.target.value)} />
            <input type="number" name="position_padding_bottom" value={padBottom} onChange={(e) => positionPadding("bottom", e.target.value)} />
          </div>
        </div>
      </div>
      <div>
        <button type="button" disabled={isPlaying}
          onClick={() => {
            spinePlayer.play()
            setIsPlaying(true)
          }}
        >Play
        </button>
        <button type="button" disabled={!isPlaying}
          onClick={() => {
            spinePlayer.pause()
            setIsPlaying(false)
          }}
        >
          Pause
        </button>
        <button type="button" onClick={() => {
          setFPS(defaultFps)
          setLogoDisplay(defaultShowLogo)
          resetLogoImage()
          setLogoRatio(defaultRatio)
          setLogoOpacity(defaultOpacity)
          resetBackground()
          positionReset()
          spinePlayer.play()
        }}>
          Reset
        </button>
        <button type="button" onClick={() => setShowSettings(false)}>Close</button>
      </div>
    </div>
  )
}