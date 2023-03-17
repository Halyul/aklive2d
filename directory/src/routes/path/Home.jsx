import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react'
import PropTypes from 'prop-types';
import {
  NavLink,
} from "react-router-dom";
import classes from '@/scss/home/Home.module.scss'
import { useConfig } from '@/state/config';
import {
  useLanguage
} from '@/state/language'
import { useHeader } from '@/state/header';
import { useAppbar } from '@/state/appbar';
import VoiceElement from '@/component/voice';
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils';
import CharIcon from '@/component/char_icon';
import Border from '@/component/border';
import useUmami from '@parcellab/react-use-umami';
import Switch from '@/component/switch';

const voiceOnAtom = atomWithStorage('voiceOn', false)
let lastVoiceState = 'ended'

export default function Home() {
  // eslint-disable-next-line no-unused-vars
  const _trackEvt = useUmami('/')
  const {
    setTitle,
    setTabs,
    currentTab,
    setHeaderIcon
  } = useHeader()
  const { config } = useConfig()
  const [content, setContent] = useState([])
  const [voiceOn] = useAtom(voiceOnAtom)
  const [voiceSrc, setVoiceSrc] = useState(null)
  const [voiceReplay, setVoiceReplay] = useState(false)

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
  }, [setHeaderIcon, setTabs, setTitle])

  useEffect(() => {
    setContent(config?.operators || [])
  }, [config])

  const handleAduioStateChange = useCallback((e, state) => {
    lastVoiceState = state
    if (state === 'ended') {
      setVoiceReplay(false)
    }
  }, [])

  const isShown = useCallback((type) => currentTab === 'all' || currentTab === type, [currentTab])

  const handleVoicePlay = useCallback((src) => {
    if (!voiceOn) {
      setVoiceSrc(null)
    } else {
      if (src === voiceSrc && lastVoiceState === 'ended') {
        setVoiceReplay(true)
      } else {
        setVoiceSrc(src)
      }
    }
  }, [voiceOn, voiceSrc])

  return (
    <section>
      {
        content.map((v) => {
          const length = v.filter((v) => isShown(v.type)).length
          return (
            <section key={v[0].date} hidden={length === 0}>
              <section className={classes.group}>
                {v.map(item => {
                  return (
                    <OperatorElement
                      key={item.link}
                      item={item}
                      hidden={!isShown(item.type)}
                      handleVoicePlay={handleVoicePlay}
                    />
                  )
                })}
                <section className={classes.date}>{v[0].date}</section>
              </section>
              <Border />
            </section>
          )
        })
      }
      <VoiceSwitchElement
        src={voiceSrc}
        handleAduioStateChange={handleAduioStateChange}
        replay={voiceReplay}
      />
    </section>
  )
}

function OperatorElement({ item, hidden, handleVoicePlay }) {
  const { textDefaultLang, language, alternateLang } = useLanguage()

  return useMemo(() => {
    return (
      <NavLink
        to={`/${item.link}`}
        className={classes.item}
        hidden={hidden}
      >
        <section
          onMouseEnter={() => handleVoicePlay(`/${item.link}/assets/${JSON.parse(import.meta.env.VITE_VOICE_FOLDERS).main}/${import.meta.env.VITE_APP_VOICE_URL}`)}
        >
          <section className={classes['background-filler']} />
          <section className={classes.outline} />
          <section className={classes.img}>
            <ImageElement
              item={item}
            />
          </section>
          <section className={classes.info}>
            <section className={classes.container}>
              <section className={classes.title}>{item.codename[language]}</section>
              <section className={classes.type}>
                <CharIcon
                  type={item.type}
                  viewBox={
                    item.type === 'operator' ? '0 0 88.969 71.469' : '0 0 94.563 67.437'
                  } />
              </section>
            </section>
            <section className={classes.wrapper}>
              <span className={classes.text}>{item.codename[language.startsWith("en") ? alternateLang : textDefaultLang]}</span>
            </section>
            <section className={classes.background} style={{
              color: item.color
            }} />
          </section>
        </section>
      </NavLink>
    )
  }, [item, hidden, language, alternateLang, textDefaultLang, handleVoicePlay])
}

function VoiceSwitchElement({ src, replay, handleAduioStateChange }) {
  const [voiceOn, setVoiceOn] = useAtom(voiceOnAtom)
  const {
    setExtraArea,
  } = useAppbar()

  useEffect(() => {
    setExtraArea([
      (
        <Switch
          key="voice"
          text='voice'
          on={voiceOn}
          handleOnClick={() => setVoiceOn(!voiceOn)}
        />
      )
    ])
  }, [voiceOn, setExtraArea, setVoiceOn])

  return (
    <VoiceElement 
      src={src}
      replay={replay}
      handleAduioStateChange={handleAduioStateChange}
    />
  )
}

VoiceSwitchElement.propTypes = {
  src: PropTypes.string,
  replay: PropTypes.bool,
  handleAduioStateChange: PropTypes.func,
}

function ImageElement({ item }) {
  const { language } = useLanguage()
  return <img src={`/${item.link}/assets/${item.fallback_name.replace("#", "%23")}_portrait.png`} alt={item.codename[language]} />
}
ImageElement.propTypes = {
  item: PropTypes.object.isRequired,
  fallback_name: PropTypes.string,
  codename: PropTypes.object,
}