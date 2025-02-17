import Events from '@/components/events'

window.wallpaperPropertyListener = {
    applyGeneralProperties: function (properties) {
        if (properties.fps) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'player',
                    key: 'fps',
                    value: properties.fps,
                })
            )
        }
    },
    applyUserProperties: function (properties) {
        if (properties.privacydonottrack) {
            document.dispatchEvent(
                Events.Insight.Register.handler(
                    !properties.privacydonottrack.value
                )
            )
        }
        if (properties.logo) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'logo',
                    key: 'hidden',
                    value: !properties.logo.value,
                })
            )
        }
        if (properties.logoratio) {
            if (properties.logoratio.value) {
                document.dispatchEvent(
                    Events.RegisterConfig.handler({
                        target: 'logo',
                        key: 'ratio',
                        value: properties.logoratio.value,
                    })
                )
            }
        }
        if (properties.logoopacity) {
            if (properties.logoopacity.value) {
                document.dispatchEvent(
                    Events.RegisterConfig.handler({
                        target: 'logo',
                        key: 'opacity',
                        value: properties.logoopacity.value,
                    })
                )
            }
        }
        if (properties.logoimage) {
            if (properties.logoimage.value) {
                document.dispatchEvent(
                    Events.RegisterConfig.handler({
                        target: 'logo',
                        key: 'image',
                        value: 'file:///' + properties.logoimage.value,
                    })
                )
            } else {
                document.dispatchEvent(
                    Events.RegisterConfig.handler({
                        target: 'logo',
                        key: 'image',
                        value: null,
                    })
                )
            }
        }
        if (properties.logox) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'logo',
                    key: 'position',
                    value: {
                        x: properties.logox.value,
                    },
                })
            )
        }
        if (properties.logoy) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'logo',
                    key: 'position',
                    value: {
                        y: properties.logoy.value,
                    },
                })
            )
        }
        if (properties.defaultbackground) {
            if (properties.defaultbackground.value) {
                document.dispatchEvent(
                    Events.RegisterConfig.handler({
                        target: 'background',
                        key: 'default',
                        value: properties.defaultbackground.value,
                    })
                )
            }
        }
        if (properties.background) {
            if (properties.background.value) {
                document.dispatchEvent(
                    Events.RegisterConfig.handler({
                        target: 'background',
                        key: 'custom',
                        value: `file:///${properties.background.value}`,
                    })
                )
            } else {
                document.dispatchEvent(
                    Events.RegisterConfig.handler({
                        target: 'background',
                        key: 'custom',
                        value: null,
                    })
                )
            }
        }
        if (properties.voicetitle) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'voice',
                    key: 'use-voice',
                    value: properties.voicetitle.value,
                })
            )
        }
        if (properties.voicelanguage) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'voice',
                    key: 'language',
                    value: properties.voicelanguage.value,
                })
            )
        }
        if (properties.voiceidle) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'voice',
                    key: 'duration',
                    value: {
                        idle: properties.voiceidle.value,
                    },
                })
            )
        }
        if (properties.voicenext) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'voice',
                    key: 'duration',
                    value: {
                        next: properties.voicenext.value,
                    },
                })
            )
        }
        if (properties.voicesubtitle) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'voice',
                    key: 'use-subtitle',
                    value: properties.voicesubtitle.value,
                })
            )
        }
        if (properties.voicesubtitlelanguage) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'voice',
                    key: 'subtitle-language',
                    value: properties.voicesubtitlelanguage.value,
                })
            )
        }
        if (properties.voicesubtitlex) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'voice',
                    key: 'subtitle-position',
                    value: {
                        x: properties.voicesubtitlex.value,
                    },
                })
            )
        }
        if (properties.voicesubtitley) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'voice',
                    key: 'subtitle-position',
                    value: {
                        y: properties.voicesubtitley.value,
                    },
                })
            )
        }
        if (properties.voiceactor) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'voice',
                    key: 'use-voice-actor',
                    value: properties.voiceactor.value,
                })
            )
        }
        if (properties.music_selection) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'music',
                    key: 'music',
                    value: properties.music_selection.value,
                })
            )
        }
        if (properties.music_title) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'music',
                    key: 'use-music',
                    value: properties.music_title.value,
                })
            )
        }
        if (properties.music_volume) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'music',
                    key: 'volume',
                    value: properties.music_volume.value,
                })
            )
        }
        if (properties.custom_music) {
            if (properties.custom_music.value) {
                document.dispatchEvent(
                    Events.RegisterConfig.handler({
                        target: 'music',
                        key: 'custom',
                        value: `file:///${properties.custom_music.value}`,
                    })
                )
            } else {
                document.dispatchEvent(
                    Events.RegisterConfig.handler({
                        target: 'music',
                        key: 'custom',
                        value: null,
                    })
                )
            }
        }
        if (properties.custom_video) {
            if (properties.custom_video.value) {
                document.dispatchEvent(
                    Events.RegisterConfig.handler({
                        target: 'background',
                        key: 'video',
                        value: `file:///${properties.custom_video.value}`,
                    })
                )
            } else {
                document.dispatchEvent(
                    Events.RegisterConfig.handler({
                        target: 'background',
                        key: 'video',
                        value: null,
                    })
                )
            }
        }
        if (properties.video_volume) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'background',
                    key: 'volume',
                    value: properties.video_volume.value,
                })
            )
        }
        if (properties.scale) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'player',
                    key: 'scale',
                    value: properties.scale.value,
                })
            )
        }
        if (properties.position) {
            if (!properties.position.value) {
                document.dispatchEvent(
                    Events.RegisterConfig.handler({
                        target: 'player',
                        key: 'position',
                        value: null,
                    })
                )
            } else {
                document.dispatchEvent(
                    Events.RegisterConfig.handler({
                        target: 'player',
                        key: 'position',
                        value: {
                            left: properties.paddingleft.value,
                            right: properties.paddingright.value,
                            top: properties.paddingtop.value,
                            bottom: properties.paddingbottom.value,
                        },
                    })
                )
            }
        }
        if (properties.paddingleft) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'player',
                    key: 'position',
                    value: {
                        left: properties.paddingleft.value,
                    },
                })
            )
        }
        if (properties.paddingright) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'player',
                    key: 'position',
                    value: {
                        right: properties.paddingright.value,
                    },
                })
            )
        }
        if (properties.paddingtop) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'player',
                    key: 'position',
                    value: {
                        top: properties.paddingtop.value,
                    },
                })
            )
        }
        if (properties.paddingbottom) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'player',
                    key: 'position',
                    value: {
                        bottom: properties.paddingbottom.value,
                    },
                })
            )
        }
        if (properties.useStartAnimation) {
            document.dispatchEvent(
                Events.RegisterConfig.handler({
                    target: 'player',
                    key: 'use-start-animation',
                    value: properties.useStartAnimation.value,
                })
            )
        }
    },
}
