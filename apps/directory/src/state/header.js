import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import { useI18n } from '@/state/language'

const keyAtom = atom('')
const titleAtom = atom('')
const tabsAtom = atom([])
const currentTabAtom = atom(null)
const appbarExtraAreaAtom = atom([])
const headerIconAtom = atom(null)
const fastNaviationAtom = atom([])

export function useHeader() {
    const [key, setTitle] = useAtom(keyAtom)
    const [title, setRealTitle] = useAtom(titleAtom)
    const [tabs, setTabs] = useAtom(tabsAtom)
    const [currentTab, setCurrentTab] = useAtom(currentTabAtom)
    const [appbarExtraArea, setAppbarExtraArea] = useAtom(appbarExtraAreaAtom)
    const [headerIcon, setHeaderIcon] = useAtom(headerIconAtom)
    const [fastNavigation, setFastNavigation] = useAtom(fastNaviationAtom)
    const { i18n } = useI18n()

    useEffect(() => {
        const newTitle = i18n(key)
        document.title = `${newTitle} - ${import.meta.env.VITE_APP_TITLE}`
        setRealTitle(newTitle)
    }, [i18n, key, setRealTitle])

    return {
        title,
        setTitle,
        tabs,
        setTabs,
        currentTab,
        setCurrentTab,
        appbarExtraArea,
        setAppbarExtraArea,
        headerIcon,
        setHeaderIcon,
        fastNavigation,
        setFastNavigation,
    }
}
