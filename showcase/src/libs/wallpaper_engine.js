window.wallpaperPropertyListener = {
    applyGeneralProperties: function (properties) {
        if (properties.fps) {
            window.settings.setFPS(properties.fps)
        }
    },
    applyUserProperties: function (properties) {
        if (properties.privacydonottrack) {
            window.settings.insight(true, !properties.privacydonottrack.value)
        }
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
        if (properties.logox) {
            window.settings.logoPadding("x", properties.logox.value)
        }
        if (properties.logoy) {
            window.settings.logoPadding("y", properties.logoy.value)
        }
        if (properties.defaultbackground) {
            if (properties.defaultbackground.value) {
                window.settings.setDefaultBackground(properties.defaultbackground.value)
            }
        }
        if (properties.background) {
            if (properties.background.value) {
                window.settings.setBackgoundImage(`url('file:///${properties.background.value}')`)
            } else {
                window.settings.resetBackground()
            }
        }
        if (properties.voicetitle) {
            window.voice.useVoice = properties.voicetitle.value
        }
        if (properties.voicelanguage) {
            window.voice.language = properties.voicelanguage.value
        }
        if (properties.voiceidle) {
            window.voice.idleDuration = parseInt(properties.voiceidle.value)
        }
        if (properties.voicenext) {
            window.voice.nextDuration = parseInt(properties.voicenext.value)
        }
        if (properties.voicesubtitle) {
            window.voice.useSubtitle = properties.voicesubtitle.value
        }
        if (properties.voicesubtitlelanguage) {
            window.voice.subtitleLanguage = properties.voicesubtitlelanguage.value
        }
        if (properties.voicesubtitlex) {
            window.voice.subtitleX = properties.voicesubtitlex.value
        }
        if (properties.voicesubtitley) {
            window.voice.subtitleY = properties.voicesubtitley.value
        }
        if (properties.voiceactor) {
            window.voice.useVoiceActor = properties.voiceactor.value
        }
        if (properties.music_selection) {
            window.music.changeMusic(properties.music_selection.value)
        }
        if (properties.music_title) {
            window.music.useMusic = properties.music_title.value
        }
        if (properties.music_volume) {
            window.music.volume = properties.music_volume.value
        }
        if (properties.custom_music) {
            if (properties.custom_music.value) {
                window.settings.setMusicFromWE(`file:///${properties.custom_music.value}`)
            } else {
                window.settings.resetMusic()
            }
        }
        if (properties.custom_video) {
            if (properties.custom_video.value) {
                window.settings.setVideoFromWE(`file:///${properties.custom_video.value}`)
            } else {
                window.settings.resetVideo()
            }
        }
        if (properties.video_volume) {
            window.settings.setVideoVolume(properties.video_volume.value)
        }
        if (properties.scale) {
            window.settings.setScale(properties.scale.value)
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
        if (properties.useStartAnimation) {
            window.settings.useStartAnimation = properties.useStartAnimation.value
        }
    },
};