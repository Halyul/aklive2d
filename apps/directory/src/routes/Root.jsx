import { useState, useEffect, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
    Outlet,
    Link,
    NavLink,
    useNavigate,
    ScrollRestoration,
} from 'react-router-dom'
import classes from '@/scss/root/Root.module.scss'
import header from '@/scss/root/header.module.scss'
import footer from '@/scss/root/footer.module.scss'
import drawer from '@/scss/root/drawer.module.scss'
import routes from '@/routes'
import { useConfig } from '@/state/config'
import { useHeader } from '@/state/header'
import { useAppbar } from '@/state/appbar'
import { useI18n, useLanguage } from '@/state/language'
import Dropdown from '@/component/dropdown'
import Popup from '@/component/popup'
import Border from '@/component/border'
import CharIcon from '@/component/char_icon'
import ToTopButton from '@/component/totop_button'

const currentYear = new Date().getFullYear()

export default function Root() {
    const [drawerHidden, setDrawerHidden] = useState(true)
    const { title, tabs, setCurrentTab, headerIcon } = useHeader()
    const { extraArea } = useAppbar()
    const { fetchOfficialUpdate } = useConfig()

    const headerTabs = useMemo(() => {
        return tabs?.map((item) => {
            return <HeaderTabsElement key={item.key} item={item} />
        })
    }, [tabs])

    const toggleDrawer = useCallback(
        (value) => {
            setDrawerHidden(value || !drawerHidden)
        },
        [drawerHidden]
    )

    useEffect(() => {
        if (tabs.length > 0) {
            setCurrentTab(tabs[0].key)
        } else {
            setCurrentTab(null)
        }
    }, [setCurrentTab, tabs])

    useEffect(() => {
        fetchOfficialUpdate()
    }, [fetchOfficialUpdate])

    useEffect(() => {
        document.querySelector('.loader').classList.add('loaded')
        setTimeout(() => {
            document.querySelector('.loader').style.display = 'none'
        }, 500)
    }, [])

    return (
        <>
            <header className={header.header}>
                <section
                    className={`${header['nav-button']} ${drawerHidden ? '' : header.active}`}
                    onClick={() => toggleDrawer()}
                >
                    <section className={header.bar} />
                    <section className={header.bar} />
                    <section className={header.bar} />
                </section>
                <HeaderButton />
                <section className={header.spacer} />
                <section className={header['extra-area']}>
                    {extraArea}
                    <LanguageDropdown />
                </section>
            </header>
            <nav
                className={`${drawer.drawer} ${drawerHidden ? '' : drawer.active}`}
            >
                <section className={drawer.links}>
                    <DrawerDestinations toggleDrawer={toggleDrawer} />
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
                                        headerIcon === 'operator'
                                            ? '0 0 88.969 71.469'
                                            : '0 0 94.563 67.437'
                                    }
                                />
                            </section>
                        )}
                        {title}
                    </section>
                    <section className={classes.tab}>{headerTabs}</section>
                </section>
                <Border />
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
                        <Link
                            reloadDocument
                            to="https://gura.ch/pp"
                            target="_blank"
                            className={footer.link}
                        >
                            {i18n('privacy_policy')}
                        </Link>
                    </section>
                    <section className={footer.item}>
                        <Link
                            reloadDocument
                            to="https://gura.ch/aklive2d-gh"
                            target="_blank"
                            className={footer.link}
                        >
                            GitHub
                        </Link>
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
                <section
                    className={`${footer.copyright} ${footer.section}`}
                    onDoubleClick={() => {
                        navigate('/error')
                    }}
                >
                    <span>
                        Spine Runtimes © 2013 - 2019 Esoteric Software LLC
                    </span>
                    <span>
                        Assets © 2017 - {currentYear} Arknights/Hypergryph Co.,
                        Ltd
                    </span>
                    <span>Source Code © 2021 - {currentYear} Halyul</span>
                </section>
            </footer>
        )
    }, [i18n, navigate])
}

function DrawerDestinations({ toggleDrawer }) {
    const { i18n } = useI18n()
    const { textDefaultLang, alternateLang } = useLanguage()

    return routes
        .filter((item) => item.inDrawer)
        .map((item) => {
            if (typeof item.element.type === 'string') {
                return (
                    <Link
                        reloadDocument
                        key={item.name}
                        to={item.path}
                        target="_blank"
                        className={drawer.link}
                        onClick={() => toggleDrawer(false)}
                    >
                        <section>{i18n(item.name, textDefaultLang)}</section>
                        <section>{i18n(item.name, alternateLang)}</section>
                    </Link>
                )
            } else {
                return (
                    <NavLink
                        to={item.path}
                        key={item.name}
                        className={({ isActive }) =>
                            `${drawer.link} ${isActive ? drawer.active : ''}`
                        }
                        onClick={() => toggleDrawer(false)}
                    >
                        <section>{i18n(item.name, textDefaultLang)}</section>
                        <section>{i18n(item.name, alternateLang)}</section>
                    </NavLink>
                )
            }
        })
}

function LanguageDropdown() {
    const { language, setLanguage } = useLanguage()
    const { i18n, i18nValues } = useI18n()

    return useMemo(() => {
        return (
            <Dropdown
                text={i18n(language)}
                altText={i18n('switch_language')}
                menu={i18nValues.available.map((item) => {
                    return {
                        name: i18n(item),
                        value: item,
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
    const { currentTab, setCurrentTab } = useHeader()
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
    const { i18n } = useI18n()
    const { fastNavigation } = useHeader()

    if (fastNavigation.length > 0) {
        return (
            <Dropdown
                menu={fastNavigation}
                altText={i18n('fast_navigation')}
                onClick={(item) => {
                    navigate(item.value)
                }}
                className={header['fast-navigate']}
                iconStyle={{
                    borderWidth: '0.15em',
                    width: '1em',
                    transform:
                        'translateY(-0.4rem) translateX(-0.7rem) rotate(-45deg)',
                    height: '1em',
                }}
                left={true}
            />
        )
    } else {
        return (
            <section className={header['back-arrow']}>
                <Link to="/" className={header.link}>
                    <section className={header.arrow1} />
                    <section className={header.arrow2} />
                </Link>
            </section>
        )
    }
}
