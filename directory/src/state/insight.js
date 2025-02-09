import React from 'react';

export default (path = null, skipPageView = false) => {
  React.useEffect(() => {
    if (!skipPageView && import.meta.env.MODE !== 'development') {
      try {
        window.counterscale = {
          q: [["set", "siteId", import.meta.env.VITE_INSIGHT_ID], ["trackPageview", {path}]],
        };
        window.counterscaleOnDemandTrack()
      } catch (err) {
        console.warn && console.warn(err.message)
      }
    }
  }, [path, skipPageView])

}