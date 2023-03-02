import {
  useState,
  useEffect,
  useMemo
} from 'react'
import './changelogs.css'
import { useHeader } from '@/state/header';
import { useAppbar } from '@/state/appbar';
import useUmami from '@parcellab/react-use-umami'
import MainBorder from '@/component/main_border';

export default function Changelogs(props) {
  const _trackEvt = useUmami('/changelogs')
  const {
    setTitle,
    setTabs,
    currentTab,
    setHeaderIcon,
  } = useHeader()
  const {
    setExtraArea,
  } = useAppbar()
  const [changelogs, setChangelogs] = useState([])

  useEffect(() => {
    setTitle('changelogs')
    setExtraArea([])
    setHeaderIcon(null)
    fetch('/_assets/changelogs.json').then(res => res.json()).then(data => {
      setChangelogs(data)
    })
  }, [])

  useEffect(() => {
    setTabs(changelogs.map((item) => {
      return {
        key: item[0].key
      }
    }))
  }, [changelogs])

  const content = useMemo(() => {
    return (
      changelogs.map((v) => {
        return (
          v.map((item) => {
            return (
              <section className="item-group-wrapper" key={item.date} hidden={currentTab !== item.key}>
                <section className="item-group">
                  <section className="item-info">
                    {item.content.map((entry, index) => {
                      return (
                        <section className="item-info-content" key={index}>
                          {entry}
                        </section>
                      )
                    })}
                  </section>
                  <section className='item-group-date'>{item.date}</section>
                </section>
                <MainBorder />
              </section>
            )
          })
        )
      })
    )
  }, [changelogs, currentTab])

  return (
    <section className="changelogs">
      {content}
    </section>
  )
}