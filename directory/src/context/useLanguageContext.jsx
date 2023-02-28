import { createContext, useState, useEffect, useCallback } from "react"
import i18nValues from '@/i18n'

export const LanguageContext = createContext()

export function LanguageProvider(props) {
    const textDefaultLang = "en-US"
    const [language, setLanguage] = useState(i18nValues.available.includes(navigator.language) ? navigator.language : "en-US") // language will be default to en-US if not available
    const [alternateLang, setAlternateLang] = useState(null) // drawerAlternateLang will be default to zh-CN if language is en-*

    useEffect(() => {
        setAlternateLang(language.startsWith("en") ? "zh-CN" : language)
    }, [language])

    const i18n = useCallback((key, preferredLanguage = language) => {
        if (i18nValues.key[key]) {
            return i18nValues.key[key][preferredLanguage]
        }
        return key
    }, [language])

    return (
        <LanguageContext.Provider
            value={{
                language, setLanguage,
                textDefaultLang,
                alternateLang,
                i18n, i18nValues
            }}
        >
            {props.children}
        </LanguageContext.Provider>
    )
}