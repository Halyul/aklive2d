import {
  useState
} from 'react'
import './dropdown.css'

export default function Dropdown(props) {
  const [hidden, setHidden] = useState(true)

  const toggleDropdown = () => {
    setHidden(!hidden)
  }

  return (
    <>
      <section className={`dropdown ${hidden ? '' : 'active'}`} >
        <section
          className='text'
          onClick={() => toggleDropdown()}
        >
          <span className='content'>{props.text}</span>
          <span className='icon'></span>
        </section>
        <ul className='menu'>
          {
            props.menu.map((item) => {
              return (
                <li
                  key={item.name}
                  className={`item${item.name === props.text ? ' active' : ''}`}
                  onClick={() => {
                    props.onClick(item)
                    toggleDropdown()
                  }}
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