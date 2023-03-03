import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from 'react'
import {
  useParams,
  useNavigate,
  Link
} from "react-router-dom";
import { atom, useAtom } from 'jotai';
import './operator.css'
import { useConfig } from '@/state/config';
import {
  useLanguage,
} from '@/state/language'
import { useHeader } from '@/state/header';
import { useAppbar } from '@/state/appbar';
import { useBackgrounds } from '@/state/background';
import useAudio from '@/libs/voice';
import useUmami from '@parcellab/react-use-umami'
import spine from '!/libs/spine-player'
import '!/libs/spine-player.css'
import MainBorder from '@/component/main_border';
import { useI18n } from '@/state/language';

const getVoiceFoler = (lang) => {
  const folderObject = JSON.parse(import.meta.env.VITE_VOICE_FOLDERS)
  const voiceFolder = folderObject.sub.find(e => e.lang === lang) || folderObject.sub.find(e => e.name === 'custom')
  return `${folderObject.main}/${voiceFolder.name}`
}
const spinePlayerAtom = atom(null);
const spineAnimationAtom = atom("Idle");
const voiceLangAtom = atom(null);
const subtitleLangAtom = atom(null);

const getTabName = (item, language) => {
  if (item.type === 'operator') {
    return 'operator'
  } else {
    return item.codename[language].replace(/^(.+)( )(·|\/)()(.+)$/, '$1')
  }
}

export default function Operator() {
  const navigate = useNavigate()
  const { operators } = useConfig()
  const { language } = useLanguage()
  const { key } = useParams();
  const {
    setTitle,
    setTabs,
    setHeaderIcon
  } = useHeader()
  const { setExtraArea } = useAppbar()
  const [config, setConfig] = useState(null)
  const [spineData, setSpineData] = useState(null)
  // eslint-disable-next-line no-unused-vars
  const _trackEvt = useUmami(`/${key}`)
  const spineRef = useRef(null)
  const [spineAnimation, setSpineAnimation] = useAtom(spineAnimationAtom)
  const { i18n } = useI18n()
  const [spinePlayer, setSpinePlayer] = useAtom(spinePlayerAtom)
  const [voiceLang, _setVoiceLang] = useAtom(voiceLangAtom)
  const { backgrounds } = useBackgrounds()
  const [currentBackground, setCurrentBackground] = useState(null)
  const [voiceConfig, setVoiceConfig] = useState(null)
  const [subtitleLang, setSubtitleLang] = useAtom(subtitleLangAtom)
  const [hideSubtitle, setHideSubtitle] = useState(true)
  const { play, stop, getSrc, isPlaying, isPlayingRef } = useAudio()
  const [subtitleObj, _setSubtitleObj] = useState(null)
  const [currentVoiceId, setCurrentVoiceId] = useState(null)
  const voiceLangRef = useRef(voiceLang)
  const subtitleObjRef = useRef(subtitleObj)
  const configRef = useRef(config)

  const setVoiceLang = (value) => {
    voiceLangRef.current = value
    _setVoiceLang(value)
  }

  const setSubtitleObj = (value) => {
    subtitleObjRef.current = value
    _setSubtitleObj(value)
  }

  useEffect(() => {
    setExtraArea([])
    stop()
  }, [setExtraArea, stop])

  useEffect(() => {
    if (backgrounds) setCurrentBackground(backgrounds[0])
  }, [backgrounds])

  useEffect(() => {
    setSpineData(null)
    const config = operators.find((item) => item.link === key)
    if (config) {
      setConfig(config)
      configRef.current = config
      fetch(`/${import.meta.env.VITE_DIRECTORY_FOLDER}/${config.filename.replace("#", "%23")}.json`).then(res => res.json()).then(data => {
        setSpineData(data)
      })
      setHeaderIcon(config.type)
      if (spineRef.current?.children.length > 0) {
        spineRef.current?.removeChild(spineRef.current?.children[0])
      }
      fetch(`/${import.meta.env.VITE_DIRECTORY_FOLDER}/voice_${config.link}.json`).then(res => res.json()).then(data => {
        setVoiceConfig(data)
      })
    }
  }, [key, operators, setHeaderIcon])

  const coverToTab = useCallback((item, language) => {
    const key = getTabName(item, language)
    return {
      key: key,
      style: {
        color: item.color
      },
      onClick: (e, tab) => {
        if (tab === key) return
        navigate(`/${item.link}`)
      }
    }
  }, [navigate])

  const otherEntries = useMemo(() => {
    if (!config || !language) return null
    return operators.filter((item) => item.id === config.id && item.link !== config.link).map((item) => {
      return coverToTab(item, language)
    })
  }, [config, language, operators, coverToTab])

  useEffect(() => {
    if (config) {
      setTabs(
        [
          coverToTab(config, language),
          ...otherEntries
        ]
      )
    }
  }, [config, key, coverToTab, setTabs, otherEntries, language])

  useEffect(() => {
    if (config) {
      setTitle(config.codename[language])
    }
  }, [config, language, key, setTitle])

  useEffect(() => {
    if (spineRef.current?.children.length === 0 && spineData && config) {
      setSpinePlayer(new spine.SpinePlayer(spineRef.current, {
        skelUrl: `./assets/${config.filename.replace('#', '%23')}.skel`,
        atlasUrl: `./assets/${config.filename.replace('#', '%23')}.atlas`,
        rawDataURIs: spineData,
        animation: spineAnimation,
        premultipliedAlpha: true,
        alpha: true,
        backgroundColor: "#00000000",
        viewport: {
          debugRender: false,
          padLeft: `${config.viewport_left}%`,
          padRight: `${config.viewport_right}%`,
          padTop: `${config.viewport_top}%`,
          padBottom: `${config.viewport_bottom}%`,
          x: 0,
          y: 0,
        },
        showControls: false,
        touch: false,
        fps: 60,
        defaultMix: 0,
        success: (player) => {
          let lastVoiceId = null
          let currentVoiceId = null
          player.canvas.onclick = () => {
            if (!voiceLangRef.current) return
            const voiceId = () => {
              const keys = Object.keys(subtitleObjRef.current)
              const id = keys[Math.floor((Math.random() * keys.length))]
              return id === lastVoiceId ? voiceId() : id
            }
            const id = voiceId()
            currentVoiceId = id
            setCurrentVoiceId(id)
            play(
              `/${configRef.current.link}/assets/${getVoiceFoler(voiceLangRef.current)}/${id}.ogg`,
              () => {
                lastVoiceId = currentVoiceId
              }
            )
          }
        }
      }))
    }
  }, [config, spineData, setSpinePlayer, spineAnimation, play]);

  useEffect(() => {
    if (voiceConfig && voiceLang) {
      let subtitleObj = voiceConfig.subtitleLangs[subtitleLang || 'zh-CN']
      let subtitleKey = 'default'
      if (subtitleObj[voiceLang]) {
        subtitleKey = voiceLang
      }
      setSubtitleObj(subtitleObj[subtitleKey])
    }
  }, [subtitleLang, voiceConfig, voiceLang])

  useEffect(() => {
    if (subtitleLang) {
      if (isPlaying) {
        setHideSubtitle(false)
      } else {
        const autoHide = () => {
          if (isPlayingRef.current) return
          setHideSubtitle(true)
        }
        setTimeout(autoHide, 5 * 1000)
        return () => {
          clearTimeout(autoHide)
        }
      }
    } else {
      setHideSubtitle(true)
    }
  }, [subtitleLang, isPlaying, isPlayingRef])

  useEffect(() => {
    if (voiceLang && isPlaying) {
      const audioUrl = `/assets/${getVoiceFoler(voiceLang)}/${currentVoiceId}.ogg`
      if (getSrc() !== (window.location.href.replace(/\/$/g, '') + audioUrl)) {
        play(`/${config.link}${audioUrl}`)
      }
    }
  }, [voiceLang, isPlaying, currentVoiceId, config, getSrc, play])

  useEffect(() => {
    if (voiceLang && config) {
      let id = ''
      if (spineAnimation === 'Idle') id = 'CN_011'
      if (spineAnimation === 'Interact') id = 'CN_034'
      if (spineAnimation === 'Special') id = 'CN_042'
      setCurrentVoiceId(id)
      play(
        `/${config.link}/assets/${getVoiceFoler(voiceLang)}/${id}.ogg`
      )
    }
  }, [voiceLang, config, spineAnimation, play])

  const spineSettings = [
    {
      name: 'animation',
      options: [
        {
          name: 'idle',
          onClick: () => {
            spinePlayer.setAnimation("Idle", true)
            setSpineAnimation('Idle')
          },
          activeRule: () => {
            return spineAnimation === 'Idle'
          }
        }, {
          name: 'interact',
          onClick: () => {
            spinePlayer.setAnimation("Interact", true)
            setSpineAnimation('Interact')
          },
          activeRule: () => {
            return spineAnimation === 'Interact'
          }
        }, {
          name: 'special',
          onClick: () => {
            spinePlayer.setAnimation("Special", true)
            setSpineAnimation('Special')
          },
          activeRule: () => {
            return spineAnimation === 'Special'
          }
        }
      ]
    }, {
      name: 'voice',
      options: voiceConfig && Object.keys(voiceConfig?.voiceLangs["zh-CN"]).map((item) => {
        return {
          name: i18n(item),
          onClick: () => {
            if (voiceLang !== item) {
              setVoiceLang(item)
            } else {
              setVoiceLang(null)
            }
          },
          activeRule: () => {
            return voiceLang === item
          }
        }
      }) || []
    }, {
      name: 'subtitle',
      options: voiceConfig && Object.keys(voiceConfig?.subtitleLangs).map((item) => {
        return {
          name: i18n(item),
          onClick: () => {
            if (subtitleLang !== item) {
              setSubtitleLang(item)
            } else {
              setSubtitleLang(null)
            }
          },
          activeRule: () => {
            return subtitleLang === item
          }
        }
      }) || []
    }, {
      name: 'backgrounds',
      options: backgrounds.map((item) => {
        return {
          name: item,
          onClick: () => {
            setCurrentBackground(item)
          },
          activeRule: () => {
            return currentBackground === item
          }
        }
      }) || []
    }
  ]

  return (
    <section className="operator">
      <section className="spine-player-wrapper">
        <section className="spine-settings" style={{
          color: config?.color
        }}>
          {
            spineSettings.map((item) => {
              if (item.options.length === 0) return null
              return (
                <section key={item.name}>
                  <section className='settings-title-wrapper'>
                    <section className='text'>{i18n(item.name)}</section>
                  </section>
                  <section className='settings-content-wrapper styled-selection'>
                    {item.options.map((option) => {
                      return (
                        <section className={`content ${option.activeRule && option.activeRule() ? 'active' : ''}`} onClick={(e) => option.onClick(e)} key={option.name}>
                          <section className='content-text'>
                            <section className="outline" />
                            <section className='text'>{i18n(option.name)}</section>
                            <section className='tick-icon' />
                          </section>
                        </section>
                      )
                    })}
                  </section>
                </section>
              )
            })
          }
          <section>
            <section className='settings-title-wrapper'>
              <section className='text'>{i18n('external_links')}</section>
            </section>
            <section className='settings-content-wrapper styled-selection'>
              <Link
                reloadDocument
                to={`./index.html?settings`}
                target='_blank'
                className='extra-links-item'
                style={{
                  color: config?.color
                }}
              >
                <section className='content'>
                  <section className='content-text'>
                    <section className="outline" />
                    <section className='text'>
                      {i18n('web_version')}
                    </section>
                  </section>
                </section>
              </Link>
              {
                config?.workshopId && (
                  <Link
                    reloadDocument
                    to={`https://steamcommunity.com/sharedfiles/filedetails/?id=${config.workshopId}`}
                    target='_blank'
                    className='extra-links-item'
                    style={{
                      color: config?.color
                    }}>
                    <section className='content'>
                      <section className='content-text'>
                        <section className="outline" />
                        <section className='text'>
                          {i18n('steam_workshop')}
                        </section>
                      </section>
                    </section>
                  </Link>
                )
              }
            </section>
          </section>
        </section>
        <section className="spine-container" style={currentBackground && {
          backgroundImage: `url(/${key}/assets/${import.meta.env.VITE_BACKGROUND_FOLDER}/${currentBackground})`
        }} >
          {
            config && (
              <img src={`/${config.link}/assets/${config.logo}.png`} alt={config?.codename[language]} className='operator-logo' />
            )
          }
          <section ref={spineRef} />
          {currentVoiceId && subtitleObj && (
            <section className={`voice-wrapper${hideSubtitle ? '' : ' active'}`}>
              <section className='voice-title'>{subtitleObj[currentVoiceId]?.title}</section>
              <section className='voice-subtitle'>
                <span>{subtitleObj[currentVoiceId]?.text}</span>
                <span className='voice-triangle' />
              </section>
            </section>)
          }
        </section>
      </section>
      <MainBorder />
    </section>
  )
}