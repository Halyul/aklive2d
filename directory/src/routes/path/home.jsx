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
    setTabs,
    currentTab, setCurrentTab } = useContext(HeaderContext)
  const { config } = useContext(ConfigContext)
  const {
    language,
    textDefaultLang,
    alternateLang,
    i18n
  } = useContext(LanguageContext)

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

  const renderContent = () => {
    const list = config?.filter((v) => currentTab === 'all' || currentTab === v.type)
    const content = []
    if (list) {
      console.log(list)
      let items = {}
      list.forEach(element => {
        if (items[element.date]) {
          items[element.date].push(toItemEl(element))
        } else {
          items[element.date] = [toItemEl(element)]
        }
      });
      items = Object.keys(items).sort().reverse().reduce((r, k) => {
        r[k] = items[k]
        return r
      }, {})
      for (const [date, group] of Object.entries(items)) {
        content.push(
          <section className="item-group-wrapper" key={date}>
            <section className="item-group">
              {group.map((v) => v)}
              <section className='item-group-date'>{date}</section>
            </section>
            <MainBorder />
          </section>
        )
      }
    }
    return content
  }
  const toItemEl = (item) => {
    return (
      <Link reloadDocument to={`/${item.link}`} className="item" key={item.link}>
        <section className="item-outline"/>
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
      </Link>
    )
  }
  const content = useMemo(() => renderContent(), [currentTab, config, language])

  return (
    <section className="home">
      {content}
    </section>
  )
}