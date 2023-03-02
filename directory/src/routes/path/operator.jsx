import {
  useState,
  useEffect,
  useRef,
} from 'react'
import {
  useParams,
  useNavigate
} from "react-router-dom";
import { atom, useAtom } from 'jotai';
import './operator.css'
import { useConfig } from '@/state/config';
import {
  useLanguage,
} from '@/state/language'
import { useHeader } from '@/state/header';
import { useBackgrounds } from '@/state/background';
import useUmami from '@parcellab/react-use-umami'
import spine from '!/libs/spine-player'
import '!/libs/spine-player.css'
import MainBorder from '@/component/main_border';
import { useI18n } from '@/state/language';
import Dropdown from '@/component/dropdown';

const getVoiceFoler = (lang) => {
  const folderObject = JSON.parse(import.meta.env.VITE_VOICE_FOLDERS)
  return `${folderObject.main}/${folderObject.sub.find(e => e.lang === lang).name}`
}
const configAtom = atom(null);
const spinePlayerAtom = atom(null);
const spineAnimationAtom = atom("Idle");
const audioEl = new Audio()

export default function Operator(props) {
  const navigate = useNavigate()
  const { operators } = useConfig()
  const { language } = useLanguage()
  const { key } = useParams();
  const {
    setTitle,
    setTabs,
    setAppbarExtraArea,
    setHeaderIcon
  } = useHeader()
  const [config, setConfig] = useAtom(configAtom)
  const [spineData, setSpineData] = useState(null)
  const _trackEvt = useUmami(`/operator/${key}`)
  const spineRef = useRef(null)
  const [, setSpinePlayer] = useAtom(spinePlayerAtom)
  const { currentBackground } = useBackgrounds()
  const [spineAnimation,] = useAtom(spineAnimationAtom)

  useEffect(() => {
    setAppbarExtraArea([])
  }, [])

  useEffect(() => {
    setSpineData(null)
    const config = operators.find((item) => item.link === key)
    if (config) {
      setConfig(config)
      fetch(`/_assets/${config.filename.replace("#", "%23")}.json`).then(res => res.json()).then(data => {
        setSpineData(data)
      })
      setHeaderIcon(config.type)
      if (spineRef.current?.children.length > 0) {
        spineRef.current?.removeChild(spineRef.current?.children[0])
      }
    }
  }, [operators, key])

  const getTabName = (item) => {
    if (item.type === 'operator') {
      return 'operator'
    } else {
      return item.codename[language].replace(/^(.+)( )(·|\/)()(.+)$/, '$1')
    }
  }

  const coverToTab = (item) => {
    const key = getTabName(item)
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
  }

  const getOtherEntries = () => {
    return operators.filter((item) => item.id === config.id && item.link !== config.link).map((item) => {
      return coverToTab(item)
    })
  }

  useEffect(() => {
    if (config) {
      setTabs(
        [
          coverToTab(config),
          ...getOtherEntries()
        ]
      )
    }
  }, [config, language, key])

  useEffect(() => {
    if (config) {
      setTitle(config.codename[language])
    }
  }, [config, language, key])

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
        success: (spinePlayer) => {
          spinePlayer.setAnimation(spineAnimation, true)
        }
      }))
    }
  }, [spineData]);

  return (
    <section className="operator">
      <section className="spine-player-wrapper">
        <SpineSettingsElement />
        <section className="spine-container" ref={spineRef} style={{
          backgroundImage: `url(/${key}/assets/background/${currentBackground})`
        }} />
      </section>
      <MainBorder />
    </section>
  )
}

function SpineSettingsElement() {
  const [config,] = useAtom(configAtom)
  const { i18n } = useI18n()
  const [spineAnimation, setSpineAnimation] = useAtom(spineAnimationAtom)
  const [spinePlayer,] = useAtom(spinePlayerAtom)
  const [voiceLang, setVoiceLang] = useState(null)

  const { backgrounds, currentBackground, setCurrentBackground } = useBackgrounds()

  const spineSettings = [
    {
      name: 'animation',
      options: [
        {
          name: 'Idle',
          onClick: () => {
            spinePlayer.setAnimation("Idle", true)
            setSpineAnimation('Idle')
          },
          activeRule: () => {
            return spineAnimation === 'Idle'
          }
        }, {
          name: 'Interact',
          onClick: () => {
            spinePlayer.setAnimation("Interact", true)
            setSpineAnimation('Interact')
          },
          activeRule: () => {
            return spineAnimation === 'Interact'
          }
        }, {
          name: 'Special',
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
      options: config?.voiceLangs.map((item) => {
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
    }
  ]

  return (
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
              <section className='settings-content-wrapper'>
                {item.options.map((option) => {
                  return (
                    <section className={`content ${option.activeRule && option.activeRule() ? 'active' : ''}`} onClick={() => option.onClick()} key={option.name}>
                      <section className='content-text'>
                        <section className="outline" />
                        <section className='text'>{option.name}</section>
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
      <section className='settings-title-wrapper'>
        <section className='text'>
          <Dropdown
            text={i18n('backgrounds')}
            menu={backgrounds.map((item) => {
              return {
                name: item,
                value: item
              }
            })}
            onClick={(item) => {
              setCurrentBackground(item.name)
            }}
            className='backgrounds-dropdown'
            activeRule={(item) => {
              return item?.name === currentBackground
            }}
            activeColor={{
              color: config?.color
            }}
          />
        </section>
      </section>
    </section>
  )
}