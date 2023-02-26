import { createContext, useState, useEffect } from "react"
import i18n from '@/i18n'

export const LanguageContext = createContext()

export function LanguageProvider(props) {
    const textDefaultLang = "en-US"
    const [language, setLanguage] = useState(i18n.available.includes(navigator.language) ? navigator.language : "en-US") // language will be default to en-US if not available
    const [alternateLang, setAlternateLang] = useState(null) // drawerAlternateLang will be default to zh-CN if language is en-*

    useEffect(() => {
        setAlternateLang(language.startsWith("en") ? "zh-CN" : language)
    }, [language])

    return (
        <LanguageContext.Provider
            value={{
                language, setLanguage,
                textDefaultLang,
                alternateLang,
                i18n
            }}
        >
            {props.children}
        </LanguageContext.Provider>
    )
}