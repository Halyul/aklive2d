import * as Counterscale from "@counterscale/tracker";
import React from 'react';

Counterscale.init({
  siteId: "aklive2d",
  reporterUrl: "https://insight.halyul.dev/collect",
  autoTrackPageviews: false,
});

export default (path = "", skipPageView = false) => {
  React.useEffect(() => {
    if (!skipPageView && import.meta.env.MODE !== 'development') {
      try {
        Counterscale.trackPageview({
          url: `/${path}`
        });
      } catch (err) {
        console.warn && console.warn(err.message)
      }
    }
  }, [path, skipPageView])

}