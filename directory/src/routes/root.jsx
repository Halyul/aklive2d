import {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback
} from 'react'
import {
  Outlet,
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";
import './root.css'
import routes from '@/routes'
import { useConfig } from '@/state/config';
import { useHeader } from '@/state/header';
import {
  useI18n,
  useLanguage,
} from '@/state/language'
import Dropdown from '@/component/dropdown';
import Popup from '@/component/popup';
import ReturnButton from '@/component/return_button';
import MainBorder from '@/component/main_border';
import CharIcon from '@/component/char_icon';

export default function Root(props) {
  const [drawerHidden, setDrawerHidden] = useState(true)
  const { textDefaultLang, language, alternateLang } = useLanguage()
  const {
    title,
    tabs,
    currentTab, setCurrentTab,
    appbarExtraArea,
    headerIcon
  } = useHeader()
  const { version } = useConfig()
  const [drawerDestinations, setDrawerDestinations] = useState(null)
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const [headerTabs, setHeaderTabs] = useState(null)
  const { i18n } = useI18n()

  const renderHeaderTabs = (tabs) => {
    setHeaderTabs(tabs?.map((item) => {
      return (
        <section
          key={item.key}
          className={`main-tab-item ${currentTab === item.key ? 'active' : ''}`}
          onClick={(e) => {
            setCurrentTab(item.key)
            item.onClick && item.onClick(e, currentTab)
          }}
          style={item.style}
        >
          <span className='text'>{i18n(item.key)}</span>
        </section>
      )
    }))
  }

  const toggleDrawer = useCallback((value) => {
    setDrawerHidden(value || !drawerHidden)
  }, [drawerHidden])

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
      setCurrentTab(tabs[0].key)
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
        <LanguageDropdown />
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
          <section className='main-title'>
              {headerIcon && (
              <section className='main-icon'>
                <CharIcon
                  type={headerIcon}
                  viewBox={
                    headerIcon === 'operator' ? '0 0 88.969 71.469' : '0 0 94.563 67.437'
                  }
                />
              </section>
              )}
              {title}
          </section>
          <section className='main-tab'>
            {headerTabs}
          </section>
        </section>
        <HeaderReturnButton />
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
          <span>Directory @ {version.directory}</span>
          <span>Showcase @ {version.showcase}</span>
        </section>
      </footer>
    </>
  )
}

function LanguageDropdown() {
  const { language, setLanguage } = useLanguage()
  const { i18n, i18nValues } = useI18n()

  return (
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
  )
}

function HeaderReturnButton() {
  const navigate = useNavigate()

  const onClick = useCallback(() => {
    navigate("/")
  }, [])

  const children = useMemo(() => {
    return (
      <ReturnButton
        className='return-button'
        onClick={onClick}
      />
    )
  }, [])

  return (
    <MainBorder>
      {children}
    </MainBorder>
  )
}