import React, {
  useState,
} from 'react'
import './popup.css'
import ReturnButton from '@/component/return_button';
import MainBorder from '@/component/main_border';
import PropTypes from 'prop-types';

export default function Popup(props) {
  const [hidden, setHidden] = useState(true)

  const toggle = () => {
    setHidden(!hidden)
  }

  return (<>
    <section className={`popup ${hidden ? '' : 'active'}`}>
      <section className='wrapper'>
        <section className='title'>
          <section className="text">{props.title}</section>
          <ReturnButton onClick={toggle} className="return-button" />
        </section>
        <MainBorder />
        <section className='content'>
          {props.children}
        </section>
      </section>
      <section className={`overlay ${hidden ? '' : 'active'}`}
        onClick={() => toggle()} />
    </section>
    <span
      className="popup-text"
      onClick={toggle}
    >
      {props.title}
    </span>
  </>)
}
Popup.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};