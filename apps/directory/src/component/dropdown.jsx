import {
  useState,
} from 'react'
import PropTypes from 'prop-types';
import classes from './scss/dropdown.module.scss'

export default function Dropdown(props) {
  const [hidden, setHidden] = useState(true)

  const toggleDropdown = () => {
    setHidden(!hidden)
  }

  return (
    <>
      <section className={`${classes.dropdown} ${hidden ? '' : classes.active} ${props.className ? props.className : ''} ${props.left ? classes.left : ''}`}>
        <section
          className={classes.text}
          onClick={() => toggleDropdown()}
        >
          <span className={classes.content}>{props.text}</span>
          <span className={classes.icon} style={props.iconStyle}></span>
          <section
            className={classes.popup}
          >
            <span className={classes.text}>{props.altText}</span>
          </section>
        </section>
        <ul className={classes.menu} style={props.activeColor}>
          {
            props.menu.map((item) => {
              switch (item.type) {
                case 'date': {
                  return (
                    <section
                      key={item.name}
                      className={classes.date}
                    >
                      <section className={classes.line} />
                      <section className={classes.text}>{item.name}</section>
                    </section>
                  )
                }
                case 'custom': {
                  return (
                    item.component
                  )
                }
                default: {
                  return (
                    <li
                      key={item.name}
                      className={`${classes.item} ${item.name === props.text || (props.activeRule && props.activeRule(item)) ? classes.active : ''}`}
                      onClick={() => {
                        props.onClick(item)
                        toggleDropdown()
                      }}
                      style={item.color ? { color: item.color } : {}}
                    >
                      {
                        item.icon ? (
                          <section className={classes["item-icon"]}>
                            {item.icon}
                          </section>
                        ) : null
                      }
                      <section className={classes.text}>{item.name}</section>
                    </li>
                  )
                }
              }
            })
          }
        </ul>
        <section
          className={classes.overlay}
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
  altText: PropTypes.string,
  iconStyle: PropTypes.object,
  left: PropTypes.bool,
};