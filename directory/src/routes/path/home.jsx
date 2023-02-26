import {
  useState,
  useEffect,
  useContext,
  useMemo
} from 'react'
import {
  Link,
} from "react-router-dom";
import './home.css'
import { ConfigContext } from '@/context/useConfigContext';
import { LanguageContext } from '@/context/useLanguageContext';
import { HeaderContext } from '@/context/useHeaderContext';
import CharIcon from '@/component/char_icon';
import MainBorder from '@/component/main_border';
import useUmami from '@parcellab/react-use-umami'

export default function Home() {
  const _trackEvt = useUmami('/')
  const {
    setTitle,
    tabs, setTabs,
    currentTab, setCurrentTab } = useContext(HeaderContext)
  const { config } = useContext(ConfigContext)
  const {
    language,
    textDefaultLang,
    alternateLang,
    i18n
  } = useContext(LanguageContext)
  const [content, setContent] = useState([])

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
    const value = config.reduce((acc, cur) => {
      const date = cur.date
      if (acc[date]) {
        acc[date].push(cur)
      } else {
        acc[date] = [cur]
      }
      return acc
    }, {})
    setContent(Object.values(value).sort((a, b) => new Date(b[0].date) - new Date(a[0].date)))
  }, [config])

  const isShown = (type) => currentTab === 'all' || currentTab === type

  return (
    <section className="home">
      {
        content.map((v) => {
          const length = v.filter((v) => isShown(v.type)).length
          return (
            <section className="item-group-wrapper" key={v[0].date} hidden={length === 0}>
              <section className="item-group">
                {v.map(item => {
                  return (<Link reloadDocument to={`/${item.link}`} className="item" key={item.link} hidden={!isShown(item.type)}>
                    <section className="item-background-filler" />
                    <section className="item-outline" />
                    <section className="item-img">
                      <img src={`/${item.link}/assets/${item.fallback_name.replace("#", "%23")}_portrait.png`} alt={item.codename[language]} />
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
                  </Link>)
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