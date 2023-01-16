window.wallpaperPropertyListener = {
    applyGeneralProperties: function (properties) {
        if (properties.fps) {
            window.settings.setFPS(properties.fps)
        }
    },
    applyUserProperties: function (properties) {
        if (properties.logo) {
            window.settings.setLogoDisplay(!properties.logo.value)
        }
        if (properties.logoratio) {
            if (properties.logoratio.value) {
                window.settings.setLogoRatio(properties.logoratio.value)
            }
        }
        if (properties.logoopacity) {
            if (properties.logoopacity.value) {
                window.settings.setLogoOpacity(properties.logoopacity.value)
            }
        }
        if (properties.logoimage) {
            if (properties.logoimage.value) {
                window.settings.setLogo('file:///' + properties.logoimage.value)
            } else {
                window.settings.resetLogoImage()
            }
        }
        if (properties.background) {
            if (properties.background.value) {
                window.settings.setBackgoundImage(`url('file:///${properties.background.value}`)
            } else {
                window.settings.resetBackground()
            }
        }
        if (properties.position) {
            if (!properties.position.value) {
                window.settings.positionReset()
            }
        }
        if (properties.paddingleft) {
            window.settings.positionPadding("left", properties.paddingleft.value)
        }
        if (properties.paddingright) {
            window.settings.positionPadding("right", properties.paddingright.value)
        }
        if (properties.paddingtop) {
            window.settings.positionPadding("top", properties.paddingtop.value)
        }
        if (properties.paddingbottom) {
            window.settings.positionPadding("bottom", properties.paddingbottom.value)
        }
    },
};