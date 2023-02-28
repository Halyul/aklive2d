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
  ScrollRestoration
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
    i18n, i18nValues
  } = useContext(LanguageContext)
  const {
    title,
    tabs,
    currentTab, setCurrentTab,
    appbarExtraArea
  } = useContext(HeaderContext)
  const [drawerDestinations, setDrawerDestinations] = useState(null)
  const currentYear = new Date().getFullYear()
  const [headerTabs, setHeaderTabs] = useState(null)

  const renderHeaderTabs = (tabs) => {
    setHeaderTabs(tabs?.map((item) => {
      return (
        <section
          key={item}
          className={`main-tab-item ${currentTab === item ? 'active' : ''}`}
          onClick={(e) => {
            setCurrentTab(item)
            item.onClick && item.onClick(e, item)
          }}
        >
          {i18n(item)}
        </section>
      )
    }))
  }

  const toggleDrawer = (value) => {
    setDrawerHidden(value || !drawerHidden)
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
            onClick={() => toggleDrawer(false)}
          >
            <section>
              {i18n(item.name, textDefaultLang)}
            </section>
            <section>
              {i18n(item.name, alternateLang)}
            </section>
          </Link>
        )
      } else {
        return (
          <NavLink
            to={item.path}
            key={item.name}
            className="link"
            onClick={() => toggleDrawer(false)}
          >
            <section>
              {i18n(item.name, textDefaultLang)}
            </section>
            <section>
              {i18n(item.name, alternateLang)}
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

  useEffect(() => {
    if (tabs.length > 0) {
      setCurrentTab(tabs[0])
    } else {
      setCurrentTab(null)
    }
  }, [tabs])

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
          text={i18n(language)}
          menu={i18nValues.available.map((item) => {
            return {
              name: i18n(item),
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
        <Outlet />
      </main>
      <footer className='footer'>
        <section className='links section'>
          <section className="item">
            <Popup
              className='link'
              title={i18n('disclaimer')}
            >
              {i18n('disclaimer_content')}
            </Popup>
          </section>
          <section className="item">
            <Link reloadDocument to="https://privacy.halyul.dev" target="_blank" className='link'>{i18n('privacy_policy')}</Link>
          </section>
          <section className="item">
            <Link reloadDocument to="https://github.com/Halyul/aklive2d" target="_blank" className='link'>GitHub</Link>
          </section>
          <section className="item">
            <Popup 
              className='link'
              title={i18n('contact_us')}
            >
              ak#halyul.dev
            </Popup>
          </section>
        </section>
        <section className='copyright section'>
          <span>Spine Runtimes © 2013 - 2019 Esoteric Software LLC</span>
          <span>Assets © 2017 - {currentYear} Arknights/Hypergryph Co., Ltd</span>
          <span>Source Code © 2021 - {currentYear} Halyul</span>
          <span>Version: {import.meta.env.VITE_VERSION}</span>
        </section>
      </footer>
      <ScrollRestoration 
        getKey={(location, matches) => {
          // default behavior
          return location.pathname;
        }}
      />
    </>
  )
}
