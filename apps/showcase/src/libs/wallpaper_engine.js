import Events from "@/components/events"

window.wallpaperPropertyListener = {
  applyGeneralProperties: function (properties) {
    if (properties.fps) {
      document.dispatchEvent(Events.Player.SetFPS.handler(properties.fps))
    }
  },
  applyUserProperties: function (properties) {
    if (properties.privacydonottrack) {
      document.dispatchEvent(Events.Insight.Register.handler(!properties.privacydonottrack.value))
    }
    if (properties.logo) {
      document.dispatchEvent(Events.Logo.SetHidden.handler(!properties.logo.value))
    }
    if (properties.logoratio) {
      if (properties.logoratio.value) {
        document.dispatchEvent(Events.Logo.SetRatio.handler(properties.logoratio.value))
      }
    }
    if (properties.logoopacity) {
      if (properties.logoopacity.value) {
        document.dispatchEvent(Events.Logo.SetOpacity.handler(properties.logoopacity.value))
      }
    }
    if (properties.logoimage) {
      if (properties.logoimage.value) {
        document.dispatchEvent(Events.Logo.SetImage.handler('file:///' + properties.logoimage.value))
      } else {
        document.dispatchEvent(Events.Logo.ResetImage.handler())
      }
    }
    if (properties.logox) {
      document.dispatchEvent(Events.Logo.SetPosition.handler({
        x: properties.logox.value
      }))
    }
    if (properties.logoy) {
      document.dispatchEvent(Events.Logo.SetPosition.handler({
        y: properties.logoy.value
      }))
    }
    if (properties.defaultbackground) {
      if (properties.defaultbackground.value) {
        document.dispatchEvent(Events.Background.SetDefault.handler(properties.defaultbackground.value))
      }
    }
    if (properties.background) {
      if (properties.background.value) {
        document.dispatchEvent(Events.Background.SetCustom.handler(`file:///${properties.background.value}`))
      } else {
        document.dispatchEvent(Events.Background.ResetImage.handler())
      }
    }
    if (properties.voicetitle) {
      document.dispatchEvent(Events.Voice.SetUseVoice.handler(properties.voicetitle.value))
    }
    if (properties.voicelanguage) {
      document.dispatchEvent(Events.Voice.SetLanguage.handler(properties.voicelanguage.value))
    }
    if (properties.voiceidle) {
      document.dispatchEvent(Events.Voice.SetDuration.handler({
        idle: properties.voiceidle.value
      }))
    }
    if (properties.voicenext) {
      document.dispatchEvent(Events.Voice.SetDuration.handler({
        next: properties.voicenext.value
      }))
    }
    if (properties.voicesubtitle) {
      document.dispatchEvent(Events.Voice.SetUseSubtitle.handler(properties.voicesubtitle.value))
    }
    if (properties.voicesubtitlelanguage) {
      document.dispatchEvent(Events.Voice.SetSubtitleLanguage.handler(properties.voicesubtitlelanguage.value))
    }
    if (properties.voicesubtitlex) {
      document.dispatchEvent(Events.Voice.SetSubtitlePosition.handler({
        x: properties.voicesubtitlex.value
      }))
    }
    if (properties.voicesubtitley) {
      document.dispatchEvent(Events.Voice.SetSubtitlePosition.handler({
        y: properties.voicesubtitley.value
      }))
    }
    if (properties.voiceactor) {
      document.dispatchEvent(Events.Voice.SetUseVoiceActor.handler(properties.voiceactor.value))
    }
    if (properties.music_selection) {
      document.dispatchEvent(Events.Music.SetMusic.handler(properties.music_selection.value))
    }
    if (properties.music_title) {
      document.dispatchEvent(Events.Music.SetUseMusic.handler(properties.music_title.value))
    }
    if (properties.music_volume) {
      document.dispatchEvent(Events.Music.SetVolume.handler(properties.music_volume.value))
    }
    if (properties.custom_music) {
      if (properties.custom_music.value) {
        document.dispatchEvent(Events.Music.SetCustom.handler(`file:///${properties.custom_music.value}`))
      } else {
        document.dispatchEvent(Events.Music.Reset.handler())
      }
    }
    if (properties.custom_video) {
      if (properties.custom_video.value) {
        document.dispatchEvent(Events.Background.SetVideo.handler(`file:///${properties.custom_video.value}`))
      } else {
        document.dispatchEvent(Events.Background.ResetVideo.handler())
      }
    }
    if (properties.video_volume) {
      document.dispatchEvent(Events.Background.SetVolume.handler(properties.video_volume.value))
    }
    if (properties.scale) {
      document.dispatchEvent(Events.Player.SetScale.handler(properties.scale.value))
    }
    if (properties.position) {
      if (!properties.position.value) {
        document.dispatchEvent(Events.Player.ResetPadding.handler())
      } else {
        document.dispatchEvent(Events.Player.SetPadding.handler({
          left: properties.paddingleft.value,
          right: properties.paddingright.value,
          top: properties.paddingtop.value,
          bottom: properties.paddingbottom.value,
        }))
      }
    }
    if (properties.paddingleft) {
      document.dispatchEvent(Events.Player.SetPadding.handler({
        left: properties.paddingleft.value,
      }))
    }
    if (properties.paddingright) {
      document.dispatchEvent(Events.Player.SetPadding.handler({
        right: properties.paddingright.value,
      }))
    }
    if (properties.paddingtop) {
      document.dispatchEvent(Events.Player.SetPadding.handler({
        top: properties.paddingtop.value,
      }))
    }
    if (properties.paddingbottom) {
      document.dispatchEvent(Events.Player.SetPadding.handler({
        bottom: properties.paddingbottom.value,
      }))
    }
    if (properties.useStartAnimation) {
      document.dispatchEvent(Events.Player.SetUseStartAnimation.handler(properties.useStartAnimation.value))
    }
  },
};