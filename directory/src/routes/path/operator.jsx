import {
  useState,
  useEffect,
  useContext
} from 'react'
import {
  useParams,
} from "react-router-dom";
import './operator.css'
import { ConfigContext } from '@/context/useConfigContext';
import { LanguageContext } from '@/context/useLanguageContext';
import { HeaderContext } from '@/context/useHeaderContext';
import useUmami from '@parcellab/react-use-umami'

export default function Operator(props) {
  const _trackEvt = useUmami('/operator/:key')
  const { operators } = useContext(ConfigContext)
  const {
    language,
    i18n
  } = useContext(LanguageContext)
  const { key } = useParams();
  const {
    setTitle,
    setTabs,
    setAppbarExtraArea
  } = useContext(HeaderContext)
  const [config, setConfig] = useState(null)
  const [spineData, setSpineData] = useState({})

  useEffect(() => {
    setTabs([])
    setAppbarExtraArea([])
  }, [])

  useEffect(() => {
    const config = operators.find((item) => item.link === key)
    if (config) {
      setConfig(config)
      fetch(`/_assets/${config.filename.replace("#", "%23")}.json`).then(res => res.json()).then(data => {
        setSpineData(data)
      })
    }
  }, [operators])

  useEffect(() => {
    if (config) {
      setTitle(config.codename[language])
    }
  }, [config, language])

  return (
    <section>
      <section>
        1
        <button onClick={() => setTitle('123')}>123</button>
      </section>
      <section>
        2
      </section>
    </section>
  )
}