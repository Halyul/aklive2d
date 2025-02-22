import { atom, useAtom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import i18nObject from '@/i18n'

const language = i18nObject.available.includes(navigator.language)
    ? navigator.language
    : 'en-US'

const textDefaultLang = 'en-US'
const languageAtom = atomWithStorage('language', language)
const alternateLangAtom = atom((get) => {
    const language = get(languageAtom)
    return language.startsWith('en') ? 'zh-CN' : language
})

export function useI18n() {
    const language = useAtomValue(languageAtom)
    return {
        i18n: (key, preferredLanguage = language) => {
            if (i18nObject.key[key]) {
                return i18nObject.key[key][preferredLanguage]
            }
            return key
        },
        i18nValues: i18nObject,
    }
}

export function useLanguage() {
    const [language, setLanguage] = useAtom(languageAtom)
    const alternateLang = useAtomValue(alternateLangAtom)
    return {
        textDefaultLang,
        language,
        setLanguage,
        alternateLang,
    }
}
