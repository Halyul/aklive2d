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
  useLocation,
} from "react-router-dom";
import classes from '@/scss/root/Root.module.scss'
import header from '@/scss/root/header.module.scss'
import footer from '@/scss/root/footer.module.scss'
import drawer from '@/scss/root/drawer.module.scss'
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
import Border from '@/component/border';
import CharIcon from '@/component/char_icon';
import ToTopButton from '@/component/totop_button';

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
      <header className={header.header}>
        <section
          className={`${header.navButton} ${drawerHidden ? '' : header.active}`}
          onClick={() => toggleDrawer()}
        >
          <section className={header.bar} />
          <section className={header.bar} />
          <section className={header.bar} />
        </section>
        <section className={header.spacer} />
        <section className={header['extra-area']}>
          {extraArea}
          <LanguageDropdown />
        </section>
      </header>
      <nav className={`${drawer.drawer} ${drawerHidden ? '' : drawer.active}`}>
        <section
          className={drawer.links}
        >
          <DrawerDestinations 
            toggleDrawer={toggleDrawer}
          />
        </section>
        <section
          className={`${drawer.overlay} ${drawerHidden ? '' : drawer.active}`}
          onClick={() => toggleDrawer()}
        />
      </nav>
      <main className={classes.main}>
        <section className={classes.header}>
          <section className={classes.title}>
            {headerIcon && (
              <section className={classes.icon}>
                <CharIcon
                  type={headerIcon}
                  viewBox={
                    headerIcon === 'operator' ? '0 0 88.969 71.469' : '0 0 94.563 67.437'
                  }
                  style={{
                    height: "2.5rem"
                  }}
                />
              </section>
            )}
            {title}
          </section>
          <section className={classes.tab}>
            {headerTabs}
          </section>
        </section>
        <HeaderButton />
        <ToTopButton />
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
      <footer className={footer.footer}>
        <section className={`${footer.links} ${footer.section}`}>
          <section className={footer.item}>
            <Popup
              className={footer.link}
              title={i18n('disclaimer')}
            >
              {i18n('disclaimer_content')}
            </Popup>
          </section>
          <section className={footer.item}>
            <Link reloadDocument to="https://privacy.halyul.dev" target="_blank" className={footer.link}>{i18n('privacy_policy')}</Link>
          </section>
          <section className={footer.item}>
            <Link reloadDocument to="https://github.com/Halyul/aklive2d" target="_blank" className={footer.link}>GitHub</Link>
          </section>
          <section className={footer.item}>
            <Popup
              className={footer.link}
              title={i18n('contact_us')}
            >
              ak#halyul.dev
            </Popup>
          </section>
        </section>
        <section className={`${footer.copyright} ${footer.section}`} onDoubleClick={() => {
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
            className={drawer.link}
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
            className={({ isActive, }) =>
              `${drawer.link} ${isActive ? drawer.active : ''}`
            }
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
      className={`${classes.item} ${currentTab === item.key ? classes.active : ''}`}
      onClick={(e) => {
        setCurrentTab(item.key)
        item.onClick && item.onClick(e, currentTab)
      }}
      style={item.style}
    >
      <section className={classes['text-wrapper']}>
        <span>{i18n(item.key)}</span>
      </section>
    </section>
  )
}
HeaderTabsElement.propTypes = {
  item: PropTypes.object.isRequired,
}

function HeaderButton() {
  const navigate = useNavigate()
  let location = useLocation();
  const { operators } = useConfig()
  const { language } = useLanguage()

  const fastNavigateDict = useMemo(() => {
    const dict = {}
    operators.forEach((item) => {
      if (!(item.date in dict)) {
        dict[item.date] = []
      }
      dict[item.date].push({
        codename: item.codename,
        link: item.link,
      })
    })
    return dict
  }, [operators])

  const fastNavigateList = useMemo(() => {
    const list = []
    for (const [key, value] of Object.entries(fastNavigateDict)) {
      list.push({
        name: key,
        value: null,
        type: "date",
      })
      value.forEach((item) => {
        list.push({
          name: item.codename[language],
          value: item.link,
          type: "item",
        })
      })
    }
    return list
  }, [fastNavigateDict, language])

  if (location.pathname === routes.find((item) => item.index).path) {
    return (
      <Border>
        <Dropdown
          menu={fastNavigateList}
          onClick={(item) => {
            navigate(item.value)
          }}
          className={classes['operator-fast-navigate']}
        />
      </Border>
    )
  } else {
    return (
      <Border>
        <ReturnButton
          className={classes['return-button']}
          onClick={() => navigate("/")}
        />
      </Border>
    )
  }
}