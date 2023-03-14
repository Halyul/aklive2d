import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classes from './switch.module.scss';
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
      className={`${classes.switch} ${on ? classes.active : ''}`}
      onClick={() => props.handleOnClick()}
    >
      <span className={classes.text}>{i18n(props.text)}</span>
      <section className={classes.wrapper}>
        <span className={classes.line}></span>
        <span className={classes.icon}></span>
      </section>
    </section>
  )
}
Switch.propTypes = {
  on: PropTypes.bool,
  text: PropTypes.string,
  handleOnClick: PropTypes.func,
};