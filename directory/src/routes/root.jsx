import React, {
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react'
import PropTypes from 'prop-types';
import {
  Outlet,
  Link,
  NavLink,
  useNavigate,
  ScrollRestoration,
} from "react-router-dom";
import './root.css'
import routes from '@/routes'
import { useConfig } from '@/state/config';
import { useHeader } from '@/state/header';
import { useAppbar } from '@/state/appbar';
import {
  useI18n,
  useLanguage,
} from '@/state/language'
import { useBackgrounds } from '@/state/background';
import Dropdown from '@/component/dropdown';
import Popup from '@/component/popup';
import ReturnButton from '@/component/return_button';
import MainBorder from '@/component/main_border';
import CharIcon from '@/component/char_icon';

const currentYear = new Date().getFullYear()

export default function Root() {
  const [drawerHidden, setDrawerHidden] = useState(true)
  const {
    title,
    tabs,
    setCurrentTab,
    headerIcon
  } = useHeader()
  const {
    extraArea,
  } = useAppbar()
  const { fetchConfig, fetchVersion } = useConfig()
  const { fetchBackgrounds } = useBackgrounds()

  const headerTabs = useMemo(() => {
    return (
      tabs?.map((item) => {
        return (
          <HeaderTabsElement
            key={item.key}
            item={item}
          />
        )
      })
    )
  }, [tabs])

  const toggleDrawer = useCallback((value) => {
    setDrawerHidden(value || !drawerHidden)
  }, [drawerHidden])

  useEffect(() => {
    if (tabs.length > 0) {
      setCurrentTab(tabs[0].key)
    } else {
      setCurrentTab(null)
    }
  }, [setCurrentTab, tabs])

  useEffect(() => {
    fetchConfig()
    fetchVersion()
    fetchBackgrounds()
  }, [fetchBackgrounds, fetchConfig, fetchVersion])

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
        <section className='extra-area'>
          {extraArea}
          <LanguageDropdown />
        </section>
      </header>
      <nav className={`drawer ${drawerHidden ? '' : 'active'}`}>
        <section
          className='links'
        >
          <DrawerDestinations 
            toggleDrawer={toggleDrawer}
          />
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
        <ScrollRestoration />
      </main>
      <FooterElement />
    </>
  )
}

function FooterElement() {
  const { i18n } = useI18n()
  const { version } = useConfig()
  const navigate = useNavigate()

  return useMemo(() => {
    return (
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
        <section className='copyright section' onDoubleClick={() => {
          navigate('/error')
        }}>
          <span>Spine Runtimes © 2013 - 2019 Esoteric Software LLC</span>
          <span>Assets © 2017 - {currentYear} Arknights/Hypergryph Co., Ltd</span>
          <span>Source Code © 2021 - {currentYear} Halyul</span>
          <span>Directory @ {version.directory}</span>
          <span>Showcase @ {version.showcase}</span>
        </section>
      </footer>
    )
  }, [i18n, navigate, version.directory, version.showcase])
}

function DrawerDestinations({ toggleDrawer }) {
  const { i18n } = useI18n()
  const { textDefaultLang, alternateLang } = useLanguage()

  return (
    routes.filter((item) => item.inDrawer).map((item) => {
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
  )
}

function LanguageDropdown() {
  const { language, setLanguage } = useLanguage()
  const { i18n, i18nValues } = useI18n()

  return useMemo(() => {
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
  }, [i18n, i18nValues.available, language, setLanguage])
}

function HeaderTabsElement({ item }) {
  const {
    currentTab, setCurrentTab,
  } = useHeader()
  const { i18n } = useI18n()

  return (
    <section
      className={`main-tab-item ${currentTab === item.key ? 'active' : ''}`}
      onClick={(e) => {
        setCurrentTab(item.key)
        item.onClick && item.onClick(e, currentTab)
      }}
      style={item.style}
    >
      <section className='main-tab-text-wrapper'>
        <span className='text'>{i18n(item.key)}</span>
      </section>
    </section>
  )
}
HeaderTabsElement.propTypes = {
  item: PropTypes.object.isRequired,
}

function HeaderReturnButton() {
  const navigate = useNavigate()

  return useMemo(() => {
    return (
      <MainBorder>
        <ReturnButton
          className='return-button'
          onClick={() => navigate("/")}
        />
      </MainBorder>
    )
  }, [navigate])
}