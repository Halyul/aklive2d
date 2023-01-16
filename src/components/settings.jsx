import { useState, useEffect } from 'preact/hooks'
import '@/components/settings.css'
import { subscribe, unsubscribe, publish } from '@/libs/events'
import '@/libs/setting_hooks'

const getPercentage = (value) => parseInt(value.replace("%", ""))
const defaultBackgroundImage = getComputedStyle(document.body).backgroundImage

export default function Settings({
  spinePlayer, setShowSettings, hidden, logoEl
}) {
  const defaultFps = 60
  const defaultRatio = 61.8
  const defaultOpacity = 30
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

  const [eventFPSDelay, setEventFPSDelay] = useState(-1)
  const [eventLogoDelay, setEventLogoDelay] = useState(null)
  const [eventRatioDelay, setEventRatioDelay] = useState(-1)
  const [eventOpacityDelay, setEventOpacityDelay] = useState(-1)
  const [eventImageDelay, setEventImageDelay] = useState(null)
  const [eventPadLeftDelay, setEventPadLeftDelay] = useState(-1)
  const [eventPadRightDelay, setEventPadRightDelay] = useState(-1)
  const [eventPadTopDelay, setEventPadTopDelay] = useState(-1)
  const [eventPadBottomDelay, setEventPadBottomDelay] = useState(-1)
  const [eventPositionResetDelay, setEventPositionResetDelay] = useState(null)
  const [eventLogoResetDelay, setEventLogoResetDelay] = useState(null)

  useEffect(() => {
    if (spinePlayer === null) return;
    if (eventFPSDelay !== -1) {
      setFPS(eventFPSDelay)
      setEventFPSDelay(-1)
    }
    if (eventPadLeftDelay !== -1) {
      positionPadding("left", eventPadLeftDelay)
      setEventPadLeftDelay(-1)
    }
    if (eventPadRightDelay !== -1) {
      positionPadding("right", eventPadRightDelay)
      setEventPadRightDelay(-1)
    }
    if (eventPadTopDelay !== -1) {
      positionPadding("top", eventPadTopDelay)
      setEventPadTopDelay(-1)
    }
    if (eventPadBottomDelay !== -1) {
      positionPadding("bottom", eventPadBottomDelay)
      setEventPadBottomDelay(-1)
    }
    if (eventPositionResetDelay) {
      positionReset()
      setEventPositionResetDelay(null)
    }
  }, [spinePlayer])

  useEffect(() => {
    if (logoEl === null) return;
    if (eventLogoDelay !== null) {
      setLogoDisplay(eventLogoDelay)
      setEventLogoDelay(null)
    }
    if (eventRatioDelay !== -1) {
      setLogoRatio(eventRatioDelay)
      setEventRatioDelay(-1)
    }
    if (eventOpacityDelay !== -1) {
      setLogoOpacity(eventOpacityDelay)
      setEventOpacityDelay(-1)
    }
    if (eventImageDelay !== null) {
      setLogo(eventImageDelay)
      setEventImageDelay(null)
    }
    if (eventLogoResetDelay) {
      resetLogoImage()
      setEventLogoResetDelay(null)
    }
  }, [logoEl])

  const setFPS = (value) => {
    setFps(value)
    spinePlayer.setFps(value)
  }

  useEffect(() => {
    const handleListener = (e) => {
      if (spinePlayer === null) {
        setEventFPSDelay(e.detail)
        return
      }
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
      if (logoEl === null) {
        setEventLogoDelay(e.detail)
        return
      }
      setLogoDisplay(e.detail)
    }
    subscribe("settings:logo", handleListener)
    return () => unsubscribe("settings:logo", handleListener)
  }, [logoEl])

  const resize = (value) => {
    logoEl.width = window.innerWidth / 2 * (value || ratio) / 100
  }

  const setLogo = (src, invert_filter) => {
    logoEl.src = src
    resize()
    setLogoInvertFilter(invert_filter)
  }

  const readFile = (e, onload, callback) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file);
    reader.onload = readerEvent => onload(readerEvent)
    callback()
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
      if (logoEl === null) {
        setEventImageDelay(e.detail)
        return
      }
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
    const handleListener = () => {
      if (logoEl === null) {
        setEventLogoResetDelay(true)
        return
      }
      resetLogoImage()
    }
    subscribe("settings:image:reset", handleListener)
    return () => unsubscribe("settings:image:reset", handleListener)
  }, [logoEl])

  const setLogoRatio = (value) => {
    setRatio(value)
    resize(value)
  }

  useEffect(() => {
    const handleListener = (e) => {
      if (logoEl === null) {
        setEventRatioDelay(e.detail)
        return
      }
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
      if (logoEl === null) {
        setEventOpacityDelay(e.detail)
        return
      }
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
      setBackgoundImage(`url("${e.detail}")`)
    }
    subscribe("settings:background:set", handleListener)
    return () => unsubscribe("settings:background:set", handleListener)
  }, [])

  const resetBackground = () => {
    setBackgoundImage(defaultBackgroundImage)
    setBackgroundClearDisabled(true)
  }

  useEffect(() => {
    subscribe("settings:background:reset", resetBackground)
    return () => unsubscribe("settings:background:reset", resetBackground)
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
      if (spinePlayer === null) {
        switch (e.detail.key) {
          case "left":
            setEventPadLeftDelay(e.detail.value)
            break;
          case "right":
            setEventPadRightDelay(e.detail.value)
            break;
          case "top":
            setEventPadTopDelay(e.detail.value)
            break;
          case "bottom":
            setEventPadBottomDelay(e.detail.value)
            break;
        }
        return
      }
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
    const handleListener = () => {
      if (spinePlayer === null) {
        setEventPositionResetDelay(true)
        return
      }
      positionReset()
    }
    subscribe("settings:position:reset", handleListener)
    return () => unsubscribe("settings:position:reset", handleListener)
  }, [spinePlayer])

  useEffect(() => {
    const handleListener = () => {
      setShowSettings(true)
    }
    subscribe("settings:open", handleListener)
    return () => unsubscribe("settings:open", handleListener)
  }, [])

  useEffect(() => {
    const handleListener = () => {
      setShowSettings(false)
    }
    subscribe("settings:close", handleListener)
    return () => unsubscribe("settings:close", handleListener)
  }, [])

  const settingsReset = () => {
    setFPS(defaultFps)
    setLogoDisplay(defaultShowLogo)
    resetLogoImage()
    setLogoRatio(defaultRatio)
    setLogoOpacity(defaultOpacity)
    resetBackground()
    positionReset()
    spinePlayer.play()
  }

  useEffect(() => {
    const handleListener = () => {
      settingsReset()
    }
    subscribe("settings:reset", handleListener)
    return () => unsubscribe("settings:reset", handleListener)
  }, [])

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
  }, [logoEl])

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
        <button type="button" onClick={() => settingsReset()}>
          Reset
        </button>
        <button type="button" onClick={() => setShowSettings(false)}>Close</button>
      </div>
    </div>
  )
}