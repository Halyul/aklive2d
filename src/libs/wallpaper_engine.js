window.wallpaperPropertyListener = {
    applyGeneralProperties: function (properties) {
        if (properties.fps) {
            window.settings.setFPS(properties.fps)
            window.settings.functionInsights("setFPS", Object.keys(properties) !== 1)
        }
    },
    applyUserProperties: function (properties) {
        if (properties.privacydonottrack) {
            window.settings.insights(true, !properties.privacydonottrack.value)
        }
        if (properties.logo) {
            window.settings.setLogoDisplay(!properties.logo.value)
            window.settings.functionInsights("setLogoDisplay", Object.keys(properties) !== 1)
        }
        if (properties.logoratio) {
            if (properties.logoratio.value) {
                window.settings.setLogoRatio(properties.logoratio.value)
                window.settings.functionInsights("setLogoRatio", Object.keys(properties) !== 1)
            }
        }
        if (properties.logoopacity) {
            if (properties.logoopacity.value) {
                window.settings.setLogoOpacity(properties.logoopacity.value)
                window.settings.functionInsights("setLogoOpacity", Object.keys(properties) !== 1)
            }
        }
        if (properties.logoimage) {
            if (properties.logoimage.value) {
                window.settings.setLogo('file:///' + properties.logoimage.value)
                window.settings.functionInsights("setLogo", Object.keys(properties) !== 1)
            } else {
                window.settings.resetLogoImage()
            }
        }
        if (properties.logox) {
            window.settings.logoPadding("x", properties.logox.value)
            window.settings.functionInsights("logoPaddingX", Object.keys(properties) !== 1)
        }
        if (properties.logoy) {
            window.settings.logoPadding("y", properties.logoy.value)
            window.settings.functionInsights("logoPaddingY", Object.keys(properties) !== 1)
        }
        if (properties.defaultbackground) {
            if (properties.defaultbackground.value) {
                window.settings.setDefaultBackground(properties.defaultbackground.value)
                window.settings.functionInsights("setDefaultBackground", Object.keys(properties) !== 1)
            }
        }
        if (properties.background) {
            if (properties.background.value) {
                window.settings.setBackgoundImage(`url('file:///${properties.background.value}`)
                window.settings.functionInsights("setBackgoundImage", Object.keys(properties) !== 1)
            } else {
                window.settings.resetBackground()
            }
        }
        if (properties.voicetitle) {
            window.voice.useVoice = properties.voicetitle.value
            window.settings.functionInsights("useVoice", Object.keys(properties) !== 1)
        }
        if (properties.voicelanguage) {
            window.voice.language = properties.voicelanguage.value
            window.settings.functionInsights("language", Object.keys(properties) !== 1)
        }
        if (properties.voiceidle) {
            window.voice.idleDuration = parseInt(properties.voiceidle.value)
            window.settings.functionInsights("idleDuration", Object.keys(properties) !== 1)
        }
        if (properties.voicenext) {
            window.voice.nextDuration = parseInt(properties.voicenext.value)
            window.settings.functionInsights("nextDuration", Object.keys(properties) !== 1)
        }
        if (properties.voicesubtitle) {
            window.voice.useSubtitle = properties.voicesubtitle.value
            window.settings.functionInsights("useSubtitle", Object.keys(properties) !== 1)
        }
        if (properties.voicesubtitlelanguage) {
            window.voice.subtitleLanguage = properties.voicesubtitlelanguage.value
            window.settings.functionInsights("subtitleLanguage", Object.keys(properties) !== 1)
        }
        if (properties.voicesubtitlex) {
            window.voice.subtitleX = properties.voicesubtitlex.value
            window.settings.functionInsights("subtitleX", Object.keys(properties) !== 1)
        }
        if (properties.voicesubtitley) {
            window.voice.subtitleY = properties.voicesubtitley.value
            window.settings.functionInsights("subtitleY", Object.keys(properties) !== 1)
        }
        if (properties.voiceactor) {
            window.voice.useVoiceActor = properties.voiceactor.value
            window.settings.functionInsights("useVoiceActor", Object.keys(properties) !== 1)
        }
        if (properties.music_selection) {
            window.music.changeMusic(properties.music_selection.value)
            window.settings.functionInsights("music_selection", Object.keys(properties) !== 1)
        }
        if (properties.music_title) {
            window.music.useMusic = properties.music_title.value
            window.settings.functionInsights("useMusic", Object.keys(properties) !== 1)
        }
        if (properties.music_volume) {
            window.music.volume = properties.music_volume.value
            window.settings.functionInsights("music_volume", Object.keys(properties) !== 1)
        }
        if (properties.position) {
            if (!properties.position.value) {
                window.settings.positionReset()
            } else {
                window.settings.positionPadding(null, {
                    left: properties.paddingleft.value,
                    right: properties.paddingright.value,
                    top: properties.paddingtop.value,
                    bottom: properties.paddingbottom.value,
                })
            }
        }
        if (properties.paddingleft) {
            window.settings.positionPadding("left", properties.paddingleft.value)
            window.settings.functionInsights("positionPaddingLeft", Object.keys(properties) !== 1)
        }
        if (properties.paddingright) {
            window.settings.positionPadding("right", properties.paddingright.value)
            window.settings.functionInsights("positionPaddingRight", Object.keys(properties) !== 1)
        }
        if (properties.paddingtop) {
            window.settings.positionPadding("top", properties.paddingtop.value)
            window.settings.functionInsights("positionPaddingTop", Object.keys(properties) !== 1)
        }
        if (properties.paddingbottom) {
            window.settings.positionPadding("bottom", properties.paddingbottom.value)
            window.settings.functionInsights("positionPaddingBottom", Object.keys(properties) !== 1)
        }
    },
};