import {createCustomEvent} from "@/components/helper"

export default class Insight {
  #isInsightInited = false

  success() {
    this.insight(false)
  }

  insight(doNotTrack, isFromWallpaperEngine = false) {
    if (this.#isInsightInited || import.meta.env.MODE === 'development') return
    this.#isInsightInited = true
    if (doNotTrack) return
    try {
      const config = {
        path: `/${import.meta.env.VITE_LINK}`
      }
      if (isFromWallpaperEngine) config.hostname = "file://wallpaperengine.local";
      window.counterscale = {
        q: [["set", "siteId", import.meta.env.VITE_INSIGHT_ID], ["trackPageview", config]],
      };
      window.counterscaleOnDemandTrack();
    } catch (e) {
      console.warn && console.warn(e.message)
    }
  }

  get listeners() {
    return [
      {
        event: Events.Register.name, handler: e => this.insight(e.detail, true)
      }
    ]
  }
}

export const Events = {
  Register: createCustomEvent("insight-register", true)
}