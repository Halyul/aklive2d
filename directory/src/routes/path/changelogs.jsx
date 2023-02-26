import {
  useState,
  useEffect,
  useContext
} from 'react'
import './changelogs.css'
import { HeaderContext } from '@/context/useHeaderContext';
import { LanguageContext } from '@/context/useLanguageContext';
import useUmami from '@parcellab/react-use-umami'

export default function Changelogs(props) {
  const _trackEvt = useUmami('/changelogs')
  const {
    setTitle,
    setTabs,
    currentTab, setCurrentTab
  } = useContext(HeaderContext)
  const { language, i18n } = useContext(LanguageContext)

  useEffect(() => {
    setTitle('changelogs')
    setTabs([])
  }, [])

  return (
    <section>
      <section>
        Under Construction :(
      </section>
    </section>
  )
}