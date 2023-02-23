import {
  useState,
  useEffect
} from 'react'
import './home.css'

export default function Home(props) {
  useEffect(() => {
    fetch("/_assets/directory.json").then(res => res.json()).then(data => {
      console.log(data)
    })
  }, [])

  return (
    <section>
      <section>
        1233
      </section>
      <section>
        22s
      </section>
    </section>
  )
}