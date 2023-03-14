import React, {
  useState,
  useEffect,
  useMemo
} from 'react'
import classes from './changelogs.module.scss'
import { useHeader } from '@/state/header';
import { useAppbar } from '@/state/appbar';
import useUmami from '@parcellab/react-use-umami'
import MainBorder from '@/component/main_border';

export default function Changelogs() {
  // eslint-disable-next-line no-unused-vars
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
  }, [setExtraArea, setHeaderIcon, setTitle])

  useEffect(() => {
    setTabs(changelogs.map((item) => {
      return {
        key: item[0].key
      }
    }))
  }, [changelogs, setTabs])

  const content = useMemo(() => {
    return (
      changelogs.map((v) => {
        return (
          v.map((item) => {
            return (
              <section className={classes.wrapper} key={item.date} hidden={currentTab !== item.key}>
                <section className={classes.group}>
                  <section className={classes.info}>
                    {item.content.map((entry, index) => {
                      return (
                        <section className={classes.content} key={index}>
                          {entry}
                        </section>
                      )
                    })}
                  </section>
                  <section className={classes.date}>{item.date}</section>
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
    <section>
      {content}
    </section>
  )
}