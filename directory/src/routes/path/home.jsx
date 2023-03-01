import {
  useState,
  useEffect,
  useCallback
} from 'react'
import {
  NavLink,
} from "react-router-dom";
import './home.css'
import { useConfig } from '@/state/config';
import {
  useLanguage,
  useI18n
} from '@/state/language'
import { useHeader } from '@/state/header';
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils';
import CharIcon from '@/component/char_icon';
import MainBorder from '@/component/main_border';
import useUmami from '@parcellab/react-use-umami';
import Switch from '@/component/switch';

const audioEl = new Audio()
let isPlaying = false
const voiceOnAtom = atomWithStorage('voiceOn', false)

export default function Home() {
  const _trackEvt = useUmami('/')
  const {
    setTitle,
    setTabs,
    currentTab,
    setAppbarExtraArea,
    setHeaderIcon
  } = useHeader()
  const { config } = useConfig()
  const { textDefaultLang, language, alternateLang } = useLanguage()
  const [content, setContent] = useState([])
  const [voiceOn, setVoiceOn] = useAtom(voiceOnAtom)
  const { i18n } = useI18n()

  useEffect(() => {
    setTitle('dynamic_compile')
    setTabs([{
      key: 'all'
    }, {
      key: 'operator'
    }, {
      key: 'skin'
    }])
    setHeaderIcon(null)
  }, [])

  useEffect(() => {
    setContent(config?.operators || [])
  }, [config])

  const toggleVoice = useCallback(() => {
    setVoiceOn(!voiceOn)
  }, [voiceOn])

  useEffect(() => {
    setAppbarExtraArea([
      (
        <Switch
          key="voice"
          text={i18n('voice')}
          on={voiceOn}
          handleOnClick={() => toggleVoice()}
        />
      )
    ])
  }, [voiceOn, language])

  const isShown = useCallback((type) => currentTab === 'all' || currentTab === type, [currentTab])

  const playVoice = useCallback((link) => {
    const audioUrl = `/${link}/assets/voice/${import.meta.env.VITE_APP_VOICE_URL}`
    if (!voiceOn || (audioEl.src === (window.location.href.replace(/\/$/g, '') + audioUrl) && isPlaying)) return
    audioEl.src = audioUrl
    let startPlayPromise = audioEl.play()
    if (startPlayPromise !== undefined) {
      startPlayPromise
        .then(() => {
          isPlaying = true
          const audioEndedFunc = () => {
            audioEl.removeEventListener('ended', audioEndedFunc)
            isPlaying = false
          }
          audioEl.addEventListener('ended', audioEndedFunc)
        })
        .catch((e) => {
          console.log(e)
          return
        })
    }
  }, [voiceOn])

  return (
    <section className="home">
      {
        content.map((v) => {
          const length = v.filter((v) => isShown(v.type)).length
          return (
            <section className="item-group-wrapper" key={v[0].date} hidden={length === 0}>
              <section className="item-group">
                {v.map(item => {
                  return (
                    <NavLink
                      to={`/operator/${item.link}`}
                      className="item"
                      key={item.link}
                      hidden={!isShown(item.type)}
                      onMouseEnter={() => playVoice(item.link)}
                    >
                      <section className="item-background-filler" />
                      <section className="item-outline" />
                      <section className="item-img">
                        <ImageElement
                          item={item}
                          language={language}
                        />
                      </section>
                      <section className="item-info">
                        <section className="item-title-container">
                          <section className="item-title">{item.codename[language]}</section>
                          <section className="item-type">
                            <CharIcon
                              type={item.type}
                              viewBox={
                                item.type === 'operator' ? '0 0 88.969 71.469' : '0 0 94.563 67.437'
                              } />
                          </section>
                        </section>
                        <section className="item-text-wrapper">
                          <span className='item-text'>{item.codename[language.startsWith("en") ? alternateLang : textDefaultLang]}</span>
                        </section>
                        <section className="item-info-background" style={{
                          color: item.color
                        }} />
                      </section>
                    </NavLink>
                  )
                })}
                <section className='item-group-date'>{v[0].date}</section>
              </section>
              <MainBorder />
            </section>
          )
        })
      }
    </section>
  )
}

function ImageElement({ item, language }) {
  return <img src={`/${item.link}/assets/${item.fallback_name.replace("#", "%23")}_portrait.png`} alt={item.codename[language]} />
}