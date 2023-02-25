import {
  useState,
  useEffect,
  useContext
} from 'react'
import './news.css'
import { TitleContext } from '@/context/useTitleContext';

export default function News(props) {
  const { title, setTitle } = useContext(TitleContext)

  useEffect(() => {
    setTitle('news')
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