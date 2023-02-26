import {
  useState,
  useEffect,
  useContext
} from 'react'
import './operator.css'
import { HeaderContext } from '@/context/useHeaderContext';
import useUmami from '@parcellab/react-use-umami'

export default function Operator(props) {
  const _trackEvt = useUmami('/operator/:key')
  const { setTitle } = useContext(HeaderContext)

  useEffect(() => {
    setTitle('chen')
  }, [])

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