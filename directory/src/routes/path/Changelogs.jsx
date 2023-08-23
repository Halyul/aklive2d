import React, {
  useEffect,
  useMemo
} from 'react'
import classes from '@/scss/changelogs/Changelogs.module.scss'
import { useHeader } from '@/state/header';
import { useAppbar } from '@/state/appbar';
import useUmami from '@/state/insights'
import Border from '@/component/border';
import CHANGELOGS from '@/_changelogs.json'

export default function Changelogs() {
  // eslint-disable-next-line no-unused-vars
  const _trackEvt = useUmami('/changelogs', "Changelogs")
  const {
    setTitle,
    setTabs,
    currentTab,
    setHeaderIcon,
    setFastNavigation,
  } = useHeader()
  const {
    setExtraArea,
  } = useAppbar()

  useEffect(() => {
    setTitle('changelogs')
    setExtraArea([])
    setFastNavigation([])
    setHeaderIcon(null)
  }, [setExtraArea, setFastNavigation, setHeaderIcon, setTitle])

  useEffect(() => {
    setTabs(CHANGELOGS.map((item) => {
      return {
        key: item[0].key
      }
    }))
  }, [setTabs])

  const content = useMemo(() => {
    return (
      CHANGELOGS.map((v) => {
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
                <Border />
              </section>
            )
          })
        )
      })
    )
  }, [currentTab])

  return (
    <section>
      {content}
    </section>
  )
}