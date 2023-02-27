import {
  useState,
  useEffect,
  useContext,
  useRef
} from 'react'
import {
  Link,
  useOutletContext,
} from "react-router-dom";
import './home.css'
import { ConfigContext } from '@/context/useConfigContext';
import { LanguageContext } from '@/context/useLanguageContext';
import { HeaderContext } from '@/context/useHeaderContext';
import CharIcon from '@/component/char_icon';
import MainBorder from '@/component/main_border';
import useUmami from '@parcellab/react-use-umami';
import Switch from '@/component/switch';
import spine from '!/libs/spine-player';
import '!/libs/spine-player.css';

export default function Home() {
  const _trackEvt = useUmami('/')
  const { setAppbarExtraArea } = useOutletContext()
  const {
    setTitle,
    setTabs,
    currentTab, setCurrentTab
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
  const [live2dOn, setLive2dOn] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')
  const audioEl = new Audio(audioUrl)
  const live2dRefObject = useRef({})
  const live2dSpineObject = useRef({})

  useEffect(() => {
    setTitle('dynamic_compile')
    setTabs([
      {
        key: 'all',
        text: i18n.key.all
      }, {
        key: 'operator',
        text: i18n.key.elite2
      }, {
        key: 'skin',
        text: i18n.key.skin
      }
    ])
    setCurrentTab('all')
  }, [])

  useEffect(() => {
    setContent(config?.operators || [])
  }, [config])

  const toggleVoice = () => {
    setVoiceOn(!voiceOn)
    setAudioUrl('')
  }

  useEffect(() => {
    setAppbarExtraArea([
      (
        <Switch
          key="voice"
          text={i18n.key.voice[language]}
          on={voiceOn}
          handleOnClick={() => toggleVoice()}
        />
      // ), (
      //   <Switch
      //     key="live2d"
      //     text={i18n.key.live2d[language]}
      //     on={live2dOn}
      //     handleOnClick={() => setLive2dOn(!live2dOn)}
      //   />
      )
    ])
  }, [voiceOn, live2dOn])

  const isShown = (type) => currentTab === 'all' || currentTab === type

  const playVoice = (link) => {
    if (!voiceOn) return
    audioEl.src = `/${link}/assets/voice/${import.meta.env.VITE_APP_VOICE_URL}`
    let startPlayPromise = audioEl.play()
    if (startPlayPromise !== undefined) {
      startPlayPromise
        .then(() => {
          return
        })
        .catch(() => {
          return
        })
    }
  }

  const getLive2d = (link) => {
    const reactEl = <section className="live2d" ref={ref => {
      live2dRefObject.current[link] = ref
    }}></section>
    return reactEl
  }

  useEffect(() => {
    if (live2dOn) {
      Object.keys(live2dRefObject.current).forEach((link) => {
        const ref = live2dRefObject.current[link]
        if (ref) {
          if (live2dSpineObject.current[link]) {
            return
          }
          fetch(`/_assets/dyn_portrait_char_2014_nian_nian%234.json`)
            .then((res) => res.json())
            .then((data) => {
          live2dSpineObject.current[link] = new spine.SpinePlayer(ref, {
            skelUrl: `./assets/dyn_portrait_char_2014_nian_nian%234.skel`,
            atlasUrl: `./assets/dyn_portrait_char_2014_nian_nian%234.atlas`,
            rawDataURIs: data,
            animation: "Idle",
            premultipliedAlpha: true,
            alpha: true,
            backgroundColor: "#00000000",
            viewport: {
              debugRender: false,
              padLeft: `0%`,
              padRight: `0%`,
              padTop: `0%`,
              padBottom: `0%`,
              x: 0,
              y: 0,
            },
            showControls: false,
            touch: false,
            fps: 60,
            defaultMix: 0,
            success: function (widget) {

            },
          })
        })
        }
      })
    }
  }, [live2dOn])

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
                    <Link
                      reloadDocument
                      to={`/${item.link}`}
                      className="item"
                      key={item.link}
                      hidden={!isShown(item.type)}
                      onMouseEnter={(e) => playVoice(item.link)}
                    >
                      <section className="item-background-filler" />
                      <section className="item-outline" />
                      <section className="item-img">
                        {live2dOn && item.portrait !== null ? (
                          getLive2d(item.link)
                        ) : (
                            <img src={`/${item.link}/assets/${item.fallback_name.replace("#", "%23")}_portrait.png`} alt={item.codename[language]} />
                        )}
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
                    </Link>
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