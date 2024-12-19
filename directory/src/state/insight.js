import React from 'react';

export default (websiteId = "directory", skipPageView = false) => {
  React.useEffect(() => {
    if (!skipPageView && import.meta.env.MODE !== 'development') {
      try {
        window.counterscale = {
          q: [["set", "siteId", `aklive2d-${websiteId}`], ["trackPageview"]],
        };
        window.counterscaleOnDemandTrack && window.counterscaleOnDemandTrack()
      } catch (err) {
        console.warn && console.warn(err.message)
      }
    }
  }, [websiteId, skipPageView])

}