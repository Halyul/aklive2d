import {
  useState,
  useEffect
} from 'react'
import './dropdown.css'

export default function Dropdown(props) {
  const [hidden, setHidden] = useState(true)

  const toggleDropdown = () => {
    setHidden(!hidden)
  }

  return (
    <>
      <section className='dropdown'>
        <section
          className='text'
          onClick={() => toggleDropdown()}
        >
          <span className='content'>{props.text}</span>
          <span className={`icon ${hidden ? '' : 'active'}`}></span>
        </section>
        <ul className={`menu ${hidden ? '' : 'active'}`}>
          {
            props.menu.map((item) => {
              return (
                <li
                  key={item.name}
                  className={`item${item.name === props.text ? ' active' : ''}`}
                  onClick={() => props.onClick(item)}
                >
                  {item.name}
                </li>
              )
            })
          }
        </ul>
        <section
          className='overlay'
          hidden={hidden}
          onClick={() => toggleDropdown()}
        />
      </section>
    </>
  )
}