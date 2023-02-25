import {
  useState,
  useEffect,
  useContext
} from 'react'
import './home.css'
import { TitleContext } from '@/context/useTitleContext';

export default function Home(props) {
  const { title, setTitle } = useContext(TitleContext)
  useEffect(() => {
    fetch("/_assets/directory.json").then(res => res.json()).then(data => {
      console.log(data)
    })
  }, [])

  useEffect(() => {
    setTitle('dynamic_compile')
  }, [])

  return (
    <section>
      <section>
        {title}
        <button onClick={() => setTitle('123')}>123</button>
      </section>
      <section>
        22s
      </section>
    </section>
  )
}