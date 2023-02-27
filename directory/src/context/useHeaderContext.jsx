import {
  createContext,
  useState,
  useEffect,
  useContext
} from "react"
import { LanguageContext } from "@/context/useLanguageContext"

export const HeaderContext = createContext()

export function HeaderProvider(props) {
  const [key, setTitle] = useState('')
  const [title, setRealTitle] = useState('')
  const {
    language,
    i18n
  } = useContext(LanguageContext)
  const [tabs, setTabs] = useState(null)
  const [currentTab, setCurrentTab] = useState(null)

  useEffect(() => {
    let newTitle = key
    if (i18n.key[newTitle]) {
      newTitle = i18n.key[newTitle][language]
    }
    document.title = `${newTitle} - ${import.meta.env.VITE_APP_TITLE}`;
    setRealTitle(newTitle)
  }, [key, language])

  return (
    <HeaderContext.Provider value={{
      title, setTitle,
      tabs, setTabs,
      currentTab, setCurrentTab
    }}>
      {props.children}
    </HeaderContext.Provider>
  )
}