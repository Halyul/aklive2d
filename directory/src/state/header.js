import { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { useLanguage, useI18n } from "@/state/language"

const keyAtom = atom('');
const titleAtom = atom('');
const tabsAtom = atom([]);
const currentTabAtom = atom(null);
const appbarExtraAreaAtom = atom([]);
const headerIconAtom = atom(null);

export function useHeader() {
  const [key, setTitle] = useAtom(keyAtom);
  const [title, setRealTitle] = useAtom(titleAtom);
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [currentTab, setCurrentTab] = useAtom(currentTabAtom);
  const [appbarExtraArea, setAppbarExtraArea] = useAtom(appbarExtraAreaAtom);
  const [headerIcon, setHeaderIcon] = useAtom(headerIconAtom);
  const { i18n } = useI18n()
  const { language } = useLanguage()

  useEffect(() => {
    const newTitle = i18n(key)
    document.title = `${newTitle} - ${import.meta.env.VITE_APP_TITLE}`;
    setRealTitle(newTitle)
  }, [key, language])

  return {
    title, setTitle,
    tabs, setTabs,
    currentTab, setCurrentTab,
    appbarExtraArea, setAppbarExtraArea,
    headerIcon, setHeaderIcon
  }
}
