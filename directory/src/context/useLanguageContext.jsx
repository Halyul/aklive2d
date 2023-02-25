import { createContext, useState, useEffect } from "react"
import i18n from '@/i18n'

export const LanguageContext = createContext()

export function LanguageProvider(props) {
    const drawerTextDefaultLang = "en-US"
    const [language, setLanguage] = useState(i18n.available.includes(navigator.language) ? navigator.language : "en-US") // language will be default to en-US if not available
    const [drawerAlternateLang, setDrawerAlternateLang] = useState(null) // drawerAlternateLang will be default to zh-CN if language is en-*

    useEffect(() => {
        setDrawerAlternateLang(language.startsWith("en") ? "zh-CN" : language)
    }, [language])

    return (
        <LanguageContext.Provider
            value={{
                language, setLanguage,
                drawerTextDefaultLang,
                drawerAlternateLang,
                i18n
            }}
        >
            {props.children}
        </LanguageContext.Provider>
    )
}