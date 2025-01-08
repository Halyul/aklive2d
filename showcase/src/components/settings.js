import '@/components/settings.css'

export default class Settings {
  #isInsightInited = false
  #doNotTrack = false

  constructor() {
    this.isWallpaperEngine = false
    this.spinePlayer = null
  }

  success() {
    this.insight(false, false)
  }

  insight(isWallpaperEngine, doNotTrack) {
    this.isWallpaperEngine = isWallpaperEngine
    if (this.#isInsightInited || import.meta.env.MODE === 'development') return
    this.#isInsightInited = true
    this.#doNotTrack = doNotTrack
    if (this.#doNotTrack) return
    try {
      const config = {
        path: `/${import.meta.env.VITE_LINK}`
      }
      if (this.isWallpaperEngine) config.hostname = "file://wallpaperengine.local";
      window.counterscale = {
        q: [["set", "siteId", import.meta.env.VITE_INSIGHT_ID], ["trackPageview", config]],
      };
      window.counterscaleOnDemandTrack();
    } catch(e) {
      console.warn && console.warn(e.message)
    }
  }

}