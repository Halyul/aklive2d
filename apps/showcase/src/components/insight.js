import { createCustomEvent } from "@/components/helper"
import buildConfig from "!/config.json"

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
        path: `/${buildConfig.link}`
      }
      if (isFromWallpaperEngine) config.hostname = "file://wallpaperengine.local";
      window.counterscale = {
        q: [["set", "siteId", buildConfig.insight_id], ["trackPageview", config]],
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