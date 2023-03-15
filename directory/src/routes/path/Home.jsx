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
import useAudio from '@/libs/voice';
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils';
import CharIcon from '@/component/char_icon';
import Border from '@/component/border';
import useUmami from '@parcellab/react-use-umami';
import Switch from '@/component/switch';

const voiceOnAtom = atomWithStorage('voiceOn', false)

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
  const { stop } = useAudio()

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
    stop()
  }, [setHeaderIcon, setTabs, setTitle, stop])

  useEffect(() => {
    setContent(config?.operators || [])
  }, [config])

  const isShown = useCallback((type) => currentTab === 'all' || currentTab === type, [currentTab])

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
      <VoiceSwitchElement />
    </section>
  )
}

function OperatorElement({ item, hidden }) {
  const { textDefaultLang, language, alternateLang } = useLanguage()
  const { play, stop, resetSrc } = useAudio()
  const [voiceOn] = useAtom(voiceOnAtom)

  const playVoice = useCallback(() => {
    if (!voiceOn) return
    play(`/${item.link}/assets/${JSON.parse(import.meta.env.VITE_VOICE_FOLDERS).main}/${import.meta.env.VITE_APP_VOICE_URL}`)
  }, [voiceOn, play, item.link])

  useEffect(() => {
    if (!voiceOn) {
      stop()
      resetSrc()
    }
  }, [voiceOn, stop, resetSrc])

  return useMemo(() => {
    return (
      <NavLink
        to={`/${item.link}`}
        className={classes.item}
        hidden={hidden}
      >
        <section
          onMouseEnter={() => playVoice()}
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
  }, [item, hidden, language, alternateLang, textDefaultLang, playVoice])
}

function VoiceSwitchElement() {
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

  return null
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