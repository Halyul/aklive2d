import {
  useState,
  useEffect,
  useContext,
  useCallback
} from 'react'
import {
  NavLink,
} from "react-router-dom";
import './home.css'
import { ConfigContext } from '@/context/useConfigContext';
import { LanguageContext } from '@/context/useLanguageContext';
import { HeaderContext } from '@/context/useHeaderContext';
import CharIcon from '@/component/char_icon';
import MainBorder from '@/component/main_border';
import useUmami from '@parcellab/react-use-umami';
import Switch from '@/component/switch';
import db from '@/db';

const audioEl = new Audio()

export default function Home() {
  const _trackEvt = useUmami('/')
  const {
    setTitle,
    setTabs,
    currentTab,
    setAppbarExtraArea
  } = useContext(HeaderContext)
  const { config } = useContext(ConfigContext)
  const {
    language,
    textDefaultLang,
    alternateLang,
    i18n
  } = useContext(LanguageContext)
  const [content, setContent] = useState([])
  const [voiceOn, setVoiceOn] = useState(false)

  useEffect(() => {
    setTitle('dynamic_compile')
    setTabs(['all', 'operator', 'skin'])
  }, [])

  useEffect(() => {
    setContent(config?.operators || [])
  }, [config])

  const toggleVoice = () => {
    setVoiceOn(!voiceOn)
  }

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

  const isShown = (type) => currentTab === 'all' || currentTab === type

  const playVoice = useCallback((blob) => {
    const audioUrl = URL.createObjectURL(blob)
    audioEl.src = audioUrl
    let startPlayPromise = audioEl.play()
    if (startPlayPromise !== undefined) {
      startPlayPromise
        .then(() => {
          const audioEndedFunc = () => {
            audioEl.removeEventListener('ended', audioEndedFunc)
            URL.revokeObjectURL(audioUrl)
          }
          audioEl.addEventListener('ended', audioEndedFunc)
        })
        .catch(() => {
          return
        })
    }
  }, [])

  const loadVoice = (link) => {
    if (!voiceOn) return
    db.voice.get({ key: link }).then((v) => {
      if (v === undefined) {
        fetch(`/${link}/assets/voice/${import.meta.env.VITE_APP_VOICE_URL}`)
          .then(res => res.blob())
          .then(blob => {
            db.voice.put({ key: link, blob: blob })
            playVoice(blob)
          })
      } else {
        playVoice(v.blob)
      }
    })
  }

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
                      onMouseEnter={() => loadVoice(item.link)}
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
  const [blobUrl, setBlobUrl] = useState(null)

  useEffect(() => {
    db.image.get({ key: item.link }).then((v) => {
      if (v === undefined) {
        fetch(`/${item.link}/assets/${item.fallback_name.replace("#", "%23")}_portrait.png`)
          .then(res => res.blob())
          .then(blob => {
            db.image.put({ key: item.link, blob: blob })
            setBlobUrl(URL.createObjectURL(blob))
          })
      } else {
        setBlobUrl(URL.createObjectURL(v.blob))
      }
    })
  }, [item.link])

  return blobUrl ? <img src={blobUrl} alt={item.codename[language]} /> : null
}