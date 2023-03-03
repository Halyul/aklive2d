import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './switch.css';
import {
  useI18n
} from '@/state/language'

export default function Switch(props) {
  const [on, setOn] = useState(props.on)
  const { i18n } = useI18n()

  useEffect(() => {
    setOn(props.on)
  }, [props.on])

  return (
    <section
      className={`switch ${on ? 'active' : ''}`}
      onClick={() => props.handleOnClick()}
    >
      <span className='text'>{i18n(props.text)}</span>
      <section className='icon-wrapper'>
        <span className='icon-line'></span>
        <span className='icon'></span>
      </section>
    </section>
  )
}
Switch.propTypes = {
  on: PropTypes.bool,
  text: PropTypes.string,
  handleOnClick: PropTypes.func,
};