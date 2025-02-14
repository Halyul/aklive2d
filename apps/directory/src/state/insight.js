import React from 'react';
import buildConfig from "!/config.json"

export default (path = null, skipPageView = false) => {
  React.useEffect(() => {
    if (!skipPageView && import.meta.env.MODE !== 'development') {
      try {
        window.counterscale = {
          q: [["set", "siteId", buildConfig.insight_id], ["trackPageview", {path}]],
        };
        window.counterscaleOnDemandTrack()
      } catch (err) {
        console.warn && console.warn(err.message)
      }
    }
  }, [path, skipPageView])

}