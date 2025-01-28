import * as Counterscale from "@counterscale/tracker";
import { createCustomEvent } from "@/components/helper"

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
      const canonical = document.querySelector('link[rel="canonical"][href]')
      if (!canonical) {
        return;
      }
      if (isFromWallpaperEngine) canonical.href = "file://wallpaperengine.local/";
      Counterscale.init({
        siteId: "aklive2d",
        reporterUrl: "https://insight.halyul.dev/collect",
        autoTrackPageviews: false,
      });
      Counterscale.trackPageview({
        url: `/${import.meta.env.VITE_LINK}`
      });
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