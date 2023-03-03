import React, {
  useState
} from 'react'
import PropTypes from 'prop-types';
import './dropdown.css'

export default function Dropdown(props) {
  const [hidden, setHidden] = useState(true)

  const toggleDropdown = () => {
    setHidden(!hidden)
  }

  return (
    <>
      <section className={`dropdown ${props.className} ${hidden ? '' : 'active'}`} >
        <section
          className='text'
          onClick={() => toggleDropdown()}
        >
          <span className='content'>{props.text}</span>
          <span className='icon'></span>
        </section>
        <ul className='menu' style={props.activeColor}>
          {
            props.menu.map((item) => {
              return (
                <li
                  key={item.name}
                  className={`item${item.name === props.text || (props.activeRule && props.activeRule(item)) ? ' active' : ''}`}
                  onClick={() => {
                    props.onClick(item)
                    toggleDropdown()
                  }}
                >
                  <section className="text">{item.name}</section>
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
Dropdown.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string,
  menu: PropTypes.array,
  onClick: PropTypes.func,
  activeColor: PropTypes.object,
  activeRule: PropTypes.func,
};