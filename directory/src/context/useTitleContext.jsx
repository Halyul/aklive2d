import { createContext, useState, useEffect, useContext } from "react"
import { LanguageContext } from '@/context/useLanguageContext';

export const TitleContext = createContext()

export function TitleProvider(props) {
  const { i18n, language } = useContext(LanguageContext)
  const [fakeTitle, setTitle] = useState('dynamic_compile')
  const [title, setActualTitle] = useState(null)

  useEffect(() => {
    let newTitle = fakeTitle
    if (i18n.key[fakeTitle]) {
      newTitle = i18n.key[fakeTitle][language]
    }
    document.title = `${newTitle} - ${import.meta.env.VITE_APP_TITLE}`;
    setActualTitle(newTitle)
  }, [fakeTitle, language])

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {props.children}
    </TitleContext.Provider>
  )
}