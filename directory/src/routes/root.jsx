import {
  useState,
  useEffect,
  useContext
} from 'react'
import {
  Outlet,
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";
import './root.css'
import routes from '@/routes'
import { HeaderContext } from '@/context/useHeaderContext';
import { LanguageContext } from '@/context/useLanguageContext';
import Dropdown from '@/component/dropdown';
import Popup from '@/component/popup';
import ReturnButton from '@/component/return_button';
import MainBorder from '@/component/main_border';

export default function Root(props) {
  const navigate = useNavigate()
  const [drawerHidden, setDrawerHidden] = useState(true)
  const {
    language, setLanguage,
    textDefaultLang,
    alternateLang,
    i18n
  } = useContext(LanguageContext)
  const {
    title,
    tabs,
    currentTab, setCurrentTab
  } = useContext(HeaderContext)
  const [drawerDestinations, setDrawerDestinations] = useState(null)
  const currentYear = new Date().getFullYear()
  const [headerTabs, setHeaderTabs] = useState(null)
  const [appbarExtraArea, setAppbarExtraArea] = useState(null)

  const renderHeaderTabs = (tabs) => {
    setHeaderTabs(tabs?.map((item) => {
      return (
        <section
          key={item.key}
          className={`main-tab-item ${currentTab === item.key ? 'active' : ''}`}
          onClick={(e) => {
            setCurrentTab(item.key)
            item.onClick && item.onClick(e, item.key)
          }}
        >
          {item.text[language]}
        </section>
      )
    }))
  }

  const toggleDrawer = () => {
    setDrawerHidden(!drawerHidden)
  }

  const renderDrawerDestinations = () => {
    return routes.filter((item) => item.inDrawer).map((item) => {
      if (typeof item.element.type === 'string') {
        return (
          <Link reloadDocument
            key={item.name}
            to={item.path}
            target="_blank"
            className="link"
            onClick={() => toggleDrawer()}
          >
            <section>
              {i18n.key[item.name][textDefaultLang]}
            </section>
            <section>
              {i18n.key[item.name][alternateLang]}
            </section>
          </Link>
        )
      } else {
        return (
          <NavLink
            to={item.path}
            key={item.name}
            className="link"
            onClick={() => toggleDrawer()}
          >
            <section>
              {i18n.key[item.name][textDefaultLang]}
            </section>
            <section>
              {i18n.key[item.name][alternateLang]}
            </section>
          </NavLink>
        )
      }
    })
  }

  useEffect(() => {
    setDrawerDestinations(renderDrawerDestinations())
  }, [alternateLang])

  useEffect(() => {
    renderHeaderTabs(tabs)
  }, [tabs, currentTab, language])

  return (
    <>
      <header className='header'>
        <section
          className={`navButton ${drawerHidden ? '' : 'active'}`}
          onClick={() => toggleDrawer()}
        >
          <section className='bar'></section>
          <section className='bar'></section>
          <section className='bar'></section>
        </section>
        <section className='spacer' />
        {appbarExtraArea}
        <Dropdown 
          text={i18n.key[language][language]}
          menu={i18n.available.map((item) => {
            return {
              name: i18n.key[item][language],
              value: item
            }
          })}
          onClick={(item) => {
            setLanguage(item.value)
          }}
        />
      </header>
      <nav className={`drawer ${drawerHidden ? '' : 'active'}`}>
        <section
          className='links'
        >
          {drawerDestinations}
        </section>
        <section
          className={`overlay ${drawerHidden ? '' : 'active'}`}
          onClick={() => toggleDrawer()}
        />
      </nav>
      <main className='main'>
        <section className='main-header'>
          <section className='main-title'>{title}</section>
          <section className='main-tab'>
            {headerTabs}
          </section>
        </section>
        <MainBorder>
          <ReturnButton
            className='return-button'
            onClick={() => {
              navigate("/")
            }}
          />
        </MainBorder>
        <Outlet context={{setAppbarExtraArea}}/>
      </main>
      <footer className='footer'>
        <section className='links section'>
          <Popup
            className='item'
            title={i18n.key.disclaimer[language]}
          >
            {i18n.key.disclaimer_content[language]}
          </Popup>
          <span className='separator' />
          <Link reloadDocument to="https://privacy.halyul.dev" target="_blank" className='item'>{i18n.key.privacy_policy[language]}</Link>
          <span className='separator' />
          <Link reloadDocument to="https://github.com/Halyul/aklive2d" target="_blank" className='item'>Github</Link>
          <span className='separator'/>
          <Popup 
            className='item'
            title={i18n.key.contact_us[language]}
          >
            ak#halyul.dev
          </Popup>
        </section>
        <section className='copyright section'>
          <span>Spine Runtimes © 2013 - 2019 Esoteric Software LLC</span>
          <span>Assets © 2017 - {currentYear} Arknights/Hypergryph Co., Ltd</span>
          <span>Source Code © 2021 - {currentYear} Halyul</span>
          <span>Version: {import.meta.env.VITE_APP_VERSION}</span>
        </section>
      </footer>
    </>
  )
}
