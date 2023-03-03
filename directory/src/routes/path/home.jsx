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
import './home.css'
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
import MainBorder from '@/component/main_border';
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
    <section className="home">
      {
        content.map((v) => {
          const length = v.filter((v) => isShown(v.type)).length
          return (
            <section className="item-group-wrapper" key={v[0].date} hidden={length === 0}>
              <section className="item-group">
                {v.map(item => {
                  return (
                    <OperatorElement
                      key={item.link}
                      item={item}
                      hidden={!isShown(item.type)}
                    />
                  )
                })}
                <section className='item-group-date'>{v[0].date}</section>
              </section>
              <MainBorder />
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
  const { play } = useAudio()
  const [voiceOn] = useAtom(voiceOnAtom)

  const playVoice = useCallback(() => {
    if (!voiceOn) return
    play(`/${item.link}/assets/${JSON.parse(import.meta.env.VITE_VOICE_FOLDERS).main}/${import.meta.env.VITE_APP_VOICE_URL}`)
  }, [play, item.link, voiceOn])

  return useMemo(() => {
    return (
      <NavLink
        to={`/${item.link}`}
        className="item"
        hidden={hidden}
      >
        <section
          onMouseEnter={() => playVoice()}
        >
          <section className="item-background-filler" />
          <section className="item-outline" />
          <section className="item-img">
            <ImageElement
              item={item}
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