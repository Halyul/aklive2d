export const PlayerReadyEvent = new Event("player-ready");

const createCustomEvent = (name) => (detail) => new CustomEvent(name, {detail})

export const InsightRegisterEventFn = createCustomEvent("insight-register")

export const PlayerSetFPSEventFn = createCustomEvent("player-set-fps")

export const PlayerSetScaleEventFn = createCustomEvent("player-set-scale")

export const PlayerSetPaddingEventFn = createCustomEvent("player-set-padding")

export const PlayerResetPaddingEvent = new Event("player-reset-padding")

export const PlayerSetUseStartAnimationEventFn = createCustomEvent("player-set-usestartanimation")

export const LogoSetHiddenEventFn = createCustomEvent("logo-set-hidden")

export const LogoSetRatioEventFn = createCustomEvent("logo-set-ratio")

export const LogoSetOpacityEventFn = createCustomEvent("logo-set-opacity")

export const LogoSetImageEventFn = createCustomEvent("logo-set-image")

export const LogoResetImageEvent = new Event("logo-reset-image")

export const LogoSetPositionEventFn = createCustomEvent("logo-set-position")

export const BackgroundSetDefaultEventFn = createCustomEvent("background-set-default")

export const BackgroundSetCustomEventFn = createCustomEvent("background-set-custom")

export const BackgroundSetVideoEventFn = createCustomEvent("background-set-video")

export const BackgroundSetVolumeEventFn = createCustomEvent("background-set-volume")

export const BackgroundResetImageEvent = new Event("background-reset-image")

export const BackgroundResetVideoEvent = new Event("background-reset-video")

export const VoiceSetUseVoiceEventFn = createCustomEvent("voice-set-usevoice")

export const VoiceSetLanguageEventFn = createCustomEvent("voice-set-language")

export const VoiceSetDurationEventFn = createCustomEvent("voice-set-duration")

export const VoiceSetUseSubtitleEventFn = createCustomEvent("voice-set-usesubtitle")

export const VoiceSetSubtitleLanguageEventFn = createCustomEvent("voice-set-subtitlelanguage")

export const VoiceSetSubtitlePositionEventFn = createCustomEvent("voice-set-subtitleposition")

export const VoiceSetUseVoiceActorEventFn = createCustomEvent("voice-set-usevoiceactor")

export const MusicSetMusicEventFn = createCustomEvent("music-set-music")

export const MusicSetUseMusicEventFn = createCustomEvent("music-set-usemusic")

export const MusicSetVolumeEventFn = createCustomEvent("music-set-volume")

export const MusicSetCustomEventFn = createCustomEvent("music-set-custom")

export const MusicResetEvent = new Event("music-reset")
