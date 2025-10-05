import CONFIG from '!/config.json'
import { atom, useAtom } from 'jotai'
import { difference } from 'lodash-es'
import { useCallback } from 'react'

const newOperatorsAtom = atom({})
const OPERATORS = CONFIG.operators.flat()

export function useConfig() {
    const config = CONFIG
    const operators = OPERATORS
    const [newOperators, setNewOperators] = useAtom(newOperatorsAtom)

    const fetchOfficialUpdate = useCallback(async () => {
        const res = await fetch(
            'https://raw.githubusercontent.com/Halyul/aklive2d/refs/heads/main/packages/official-info/auto_update/official_info.json'
        )
        const data = await res.json().catch((e) => {
            console.error(e)
            return {
                length: 0,
            }
        })
        const compiledIds = operators.map((item) => item.official_id.toString())
        const updatedIds = data.info.map((item) => item.id.toString())
        const newIds = difference(updatedIds, compiledIds)
        setNewOperators(data.info.filter((item) => newIds.includes(item.id.toString())))
    }, [])

    return { config, operators, newOperators, fetchOfficialUpdate }
}
