import CONFIG from '!/config.json'
import { useCallback } from 'react'
import { atom, useAtom } from 'jotai'

const officialUpdateAtom = atom({})
let operators = []
CONFIG.operators.forEach((item) => {
    operators = [...operators, ...item]
})
const OPERATORS = operators

export function useConfig() {
    const config = CONFIG
    const operators = OPERATORS
    const [officialUpdate, setOfficialUpdate] = useAtom(officialUpdateAtom)

    const fetchOfficialUpdate = useCallback(async () => {
        const res = await fetch(
            'https://raw.githubusercontent.com/Halyul/aklive2d/main/official_update.json'
        )
        const data = await res.json().catch((e) => {
            console.error(e)
            return {
                length: 0,
            }
        })
        setOfficialUpdate(data)
    }, [setOfficialUpdate])

    return { config, operators, officialUpdate, fetchOfficialUpdate }
}
