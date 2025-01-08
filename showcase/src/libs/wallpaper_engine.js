import * as Event from "@/components/event"

window.wallpaperPropertyListener = {
  applyGeneralProperties: function (properties) {
    if (properties.fps) {
      document.dispatchEvent(Event.PlayerSetFPSEventFn(properties.fps))
    }
  },
  applyUserProperties: function (properties) {
    if (properties.privacydonottrack) {
      document.dispatchEvent(Event.InsightRegisterEventFn(!properties.privacydonottrack.value))
    }
    if (properties.logo) {
      document.dispatchEvent(Event.LogoSetHiddenEventFn(!properties.logo.value))
    }
    if (properties.logoratio) {
      if (properties.logoratio.value) {
        document.dispatchEvent(Event.LogoSetRatioEventFn(properties.logoratio.value))
      }
    }
    if (properties.logoopacity) {
      if (properties.logoopacity.value) {
        document.dispatchEvent(Event.LogoSetOpacityEventFn(properties.logoopacity.value))
      }
    }
    if (properties.logoimage) {
      if (properties.logoimage.value) {
        document.dispatchEvent(Event.LogoSetImageEventFn('file:///' + properties.logoimage.value))
      } else {
        document.dispatchEvent(Event.LogoResetImageEvent)
      }
    }
    if (properties.logox) {
      document.dispatchEvent(Event.LogoSetPositionEventFn({
        x: properties.logox.value
      }))
    }
    if (properties.logoy) {
      document.dispatchEvent(Event.LogoSetPositionEventFn({
        y: properties.logoy.value
      }))
    }
    if (properties.defaultbackground) {
      if (properties.defaultbackground.value) {
        document.dispatchEvent(Event.BackgroundSetDefaultEventFn(properties.defaultbackground.value))
      }
    }
    if (properties.background) {
      if (properties.background.value) {
        document.dispatchEvent(Event.BackgroundSetCustomEventFn(`url('file:///${properties.background.value}')`))
      } else {
        document.dispatchEvent(Event.BackgroundResetImageEvent)
      }
    }
    if (properties.voicetitle) {
      document.dispatchEvent(Event.VoiceSetUseVoiceEventFn(properties.voicetitle.value))
    }
    if (properties.voicelanguage) {
      document.dispatchEvent(Event.VoiceSetLanguageEventFn(properties.voicelanguage.value))
    }
    if (properties.voiceidle) {
      document.dispatchEvent(Event.VoiceSetDurationEventFn({
        idle: parseInt(properties.voiceidle.value)
      }))
    }
    if (properties.voicenext) {
      document.dispatchEvent(Event.VoiceSetDurationEventFn({
        next: parseInt(properties.voicenext.value)
      }))
    }
    if (properties.voicesubtitle) {
      document.dispatchEvent(Event.VoiceSetUseSubtitleEventFn(properties.voicesubtitle.value))
    }
    if (properties.voicesubtitlelanguage) {
      document.dispatchEvent(Event.VoiceSetSubtitleLanguageEventFn(properties.voicesubtitlelanguage.value))
    }
    if (properties.voicesubtitlex) {
      document.dispatchEvent(Event.VoiceSetSubtitlePositionEventFn({
        x: properties.voicesubtitlex.value
      }))
    }
    if (properties.voicesubtitley) {
      document.dispatchEvent(Event.VoiceSetSubtitlePositionEventFn({
        y: properties.voicesubtitley.value
      }))
    }
    if (properties.voiceactor) {
      document.dispatchEvent(Event.VoiceSetUseVoiceActorEventFn(properties.voiceactor.value))
    }
    if (properties.music_selection) {
      document.dispatchEvent(Event.MusicSetMusicEventFn(properties.music_selection.value))
    }
    if (properties.music_title) {
      document.dispatchEvent(Event.MusicSetUseMusicEventFn(properties.music_title.value))
    }
    if (properties.music_volume) {
      document.dispatchEvent(Event.MusicSetVolumeEventFn(properties.music_volume.value))
    }
    if (properties.custom_music) {
      if (properties.custom_music.value) {
        document.dispatchEvent(Event.MusicSetCustomEventFn(`file:///${properties.custom_music.value}`))
      } else {
        document.dispatchEvent(Event.MusicResetEvent)
      }
    }
    if (properties.custom_video) {
      if (properties.custom_video.value) {
        document.dispatchEvent(Event.BackgroundSetVideoEventFn(`file:///${properties.custom_video.value}`))
      } else {
        document.dispatchEvent(Event.BackgroundResetVideoEvent)
      }
    }
    if (properties.video_volume) {
      document.dispatchEvent(Event.BackgroundSetVolumeEventFn(properties.video_volume.value))
    }
    if (properties.scale) {
      document.dispatchEvent(Event.PlayerSetScaleEventFn(properties.scale.value))
    }
    if (properties.position) {
      if (!properties.position.value) {
        document.dispatchEvent(Event.PlayerResetPaddingEvent)
      } else {
        document.dispatchEvent(Event.PlayerSetPaddingEventFn({
          left: properties.paddingleft.value,
          right: properties.paddingright.value,
          top: properties.paddingtop.value,
          bottom: properties.paddingbottom.value,
        }))
      }
    }
    if (properties.paddingleft) {
      document.dispatchEvent(Event.PlayerSetPaddingEventFn({
        left: properties.paddingleft.value,
      }))
    }
    if (properties.paddingright) {
      document.dispatchEvent(Event.PlayerSetPaddingEventFn({
        right: properties.paddingright.value,
      }))
    }
    if (properties.paddingtop) {
      document.dispatchEvent(Event.PlayerSetPaddingEventFn({
        top: properties.paddingtop.value,
      }))
    }
    if (properties.paddingbottom) {
      document.dispatchEvent(Event.PlayerSetPaddingEventFn({
        bottom: properties.paddingbottom.value,
      }))
    }
    if (properties.useStartAnimation) {
      document.dispatchEvent(Event.PlayerSetUseStartAnimationEventFn(properties.useStartAnimation.value))
    }
  },
};