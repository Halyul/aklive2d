import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo
} from 'react'
import {
  useParams,
  useNavigate
} from "react-router-dom";
import './operator.css'
import { useConfig } from '@/state/config';
import {
  useLanguage,
} from '@/state/language'
import { useHeader } from '@/state/header';
import useUmami from '@parcellab/react-use-umami'

export default function Operator(props) {
  const navigate = useNavigate()
  const { operators } = useConfig()
  const { language } = useLanguage()
  const { key } = useParams();
  const {
    setTitle,
    setTabs,
    setAppbarExtraArea,
    setHeaderIcon
  } = useHeader()
  const [config, setConfig] = useState(null)
  const [spineData, setSpineData] = useState({})
  const _trackEvt = useUmami(`/operator/${key}`)

  useEffect(() => {
    setAppbarExtraArea([])
  }, [])

  useEffect(() => {
    const config = operators.find((item) => item.link === key)
    if (config) {
      setConfig(config)
      fetch(`/_assets/${config.filename.replace("#", "%23")}.json`).then(res => res.json()).then(data => {
        setSpineData(data)
      })
      setHeaderIcon(config.type)
    }
  }, [operators, key])

  const getTabName = (item) => {
    if (item.type === 'operator') {
      return 'operator'
    } else {
      return item.codename[language].replace(/^(.+)( )(·|\/)()(.+)$/, '$1')
    }
  }

  const coverToTab = (item) => {
    const key = getTabName(item)
    return {
      key: key,
      style: {
        color: item.color
      },
      onClick: (e, tab) => {
        if (tab === key) return
        navigate(`/operator/${item.link}`)
      }
    }
  }

  const getOtherEntries = () => {
    return operators.filter((item) => item.id === config.id && item.link !== config.link).map((item) => {
      return coverToTab(item)
    })
  }

  useEffect(() => {
    if (config) {
      setTabs(
        [
          coverToTab(config),
          ...getOtherEntries()
        ]
      )
    }
  }, [config, language, key])

  useEffect(() => {
    if (config) {
      setTitle(config.codename[language])
    }
  }, [config, language, key])

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