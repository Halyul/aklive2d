import {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react'
import PropTypes from 'prop-types';
import {
  NavLink,
  Link,
} from "react-router-dom";
import classes from '@/scss/home/Home.module.scss'
import { useConfig } from '@/state/config';
import { useI18n } from '@/state/language';
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
import useInsight from '@/state/insight';
import Switch from '@/component/switch';
import SearchBox from '@/component/search_box';
import buildConfig from "!/config.json"

const voiceOnAtom = atomWithStorage('voiceOn', false)
let lastVoiceState = 'ended'

export default function Home() {
  // eslint-disable-next-line no-unused-vars
  const _trackEvt = useInsight()
  const {
    setTitle,
    setTabs,
    currentTab,
    setHeaderIcon,
    setFastNavigation
  } = useHeader()
  const { config, operators, officialUpdate } = useConfig()
  const { i18n } = useI18n()
  const [content, setContent] = useState([])
  const [voiceOn] = useAtom(voiceOnAtom)
  const [voiceSrc, setVoiceSrc] = useState(null)
  const [voiceReplay, setVoiceReplay] = useState(false)
  const { language } = useLanguage()
  const [navigationList, setNavigationList] = useState([])
  const [searchField, setSearchField] = useState('');
  const [updatedList, setUpdatedList] = useState([])

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

  const fastNavigateDict = useMemo(() => {
    const dict = {}
    operators.forEach((item) => {
      if (!(item.date in dict)) {
        dict[item.date] = []
      }
      dict[item.date].push({
        codename: item.codename,
        link: item.link,
        type: item.type,
        color: item.color
      })
    })
    return dict
  }, [operators])

  useEffect(() => {
    const list = []
    for (const [key, value] of Object.entries(fastNavigateDict)) {
      const newValue = value.filter((item) => isShown(item.type))
      if (newValue.length > 0) {
        list.push({
          name: key,
          value: null,
          type: "date",
        })
        newValue.forEach((item) => {
          list.push({
            name: item.codename[language],
            value: item.link,
            type: "item",
            color: item.color,
            icon: <CharIcon
              type={item.type}
              viewBox={
                item.type === 'operator' ? '0 0 88.969 71.469' : '0 0 94.563 67.437'
              } />
          })
        })
      }
    }
    setNavigationList(list)
    setUpdatedList(list)
  }, [fastNavigateDict, isShown, language])

  useEffect(() => {
    const list = navigationList.filter((item) => { return (item.name.toLowerCase().indexOf(searchField.toLowerCase()) !== -1) || (item.type === 'date'); })
    const newList = []
    for (let i = 0; i < list.length - 1; i++) {
      const firstType = list[i].type
      const secondType = list[i + 1].type
      if (firstType === 'date' && secondType === 'date') {
        continue
      }
      newList.push(list[i])
    }
    if (list.length > 0 && list[list.length - 1].type !== 'date') {
      newList.push(list[list.length - 1])
    }
    setUpdatedList(newList)
  }, [navigationList, searchField])

  useEffect(() => {
    setFastNavigation([
      {
        type: "custom",
        component: <SearchBox
          key="search-box"
          altText={"search_by_name"}
          handleOnChange={(e) => { setSearchField(e) }}
          searchField={searchField}
        />
      },
      ...updatedList
    ])
  }, [searchField, setFastNavigation, updatedList])

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
        officialUpdate.length > operators.length && (
          <section>
            <section className={`${classes['official-update']} ${classes.group}`}>
              <section className={classes.info}>
                <section className={classes.content}>
                  <section className={classes.text}>{officialUpdate.length - operators.length} {i18n("new_op_wait_to_update")}</section>
                  <section className={`${classes['styled-selection']}`}>
                    {officialUpdate.dates.reduce((acc, cur) => {
                      const op = officialUpdate[cur];
                      return [...acc, ...op];
                    }, []).slice(0, officialUpdate.length - operators.length)
                    .map((entry, index) => {
                      return (
                        <Link
                          reloadDocument
                          to={entry.link}
                          target='_blank'
                          style={{
                            color: entry.color
                          }}
                          key={index}
                          >
                          <section className={classes.content}>
                            <section className={classes.option}>
                              <section className={classes.outline} />
                              <section className={`${classes.text} ${classes.container}`}>
                                <section className={classes.type}>
                                  <CharIcon
                                    type={entry.type}
                                    viewBox={
                                      entry.type === 'operator' ? '0 0 88.969 71.469' : '0 0 94.563 67.437'
                                    } />
                                </section>
                                <section className={classes.title}>
                                  {entry.codename[language]}
                                </section>
                                <section className={classes['arrow-icon']}>
                                  <section className={classes.bar}></section>
                                  <section className={classes.bar}></section>
                                  <section className={classes.bar}></section>
                                  <section className={classes.bar}></section>
                                </section>
                              </section>
                            </section>
                          </section>
                        </Link>
                      )
                    })}
                  </section>
                </section>

              </section>
              <section className={classes.date}>{officialUpdate.latest}</section>
            </section>
            <Border />
          </section>
        )
      }
      {
        content.map((v) => {
          const length = v.filter((v) => isShown(v.type)).length
          return (
            <section key={v[0].date} hidden={length === 0}>
              <section className={classes.group}>
                <section className={classes['operator-group']}>
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
                </section>
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
          onMouseEnter={() => handleVoicePlay(`/${item.link}/assets/${buildConfig.voice_folders.main}/${buildConfig.app_voice_url}`)}
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
  return <img src={`/${buildConfig.directory_folder}/${item.fallback_name.replace("#", "%23")}_portrait.png`} alt={item.codename[language]} />
}
ImageElement.propTypes = {
  item: PropTypes.object.isRequired,
  fallback_name: PropTypes.string,
  codename: PropTypes.object,
}