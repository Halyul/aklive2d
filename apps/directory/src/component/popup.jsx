import {
  useState,
} from 'react'
import classes from './scss/popup.module.scss';
import ReturnButton from '@/component/return_button';
import Border from '@/component/border';
import PropTypes from 'prop-types';

export default function Popup(props) {
  const [hidden, setHidden] = useState(true)

  const toggle = () => {
    setHidden(!hidden)
  }

  return (<>
    <section className={`${classes.popup} ${hidden ? '' : classes.active}`}>
      <section className={classes.wrapper}>
        <section className={classes.title}>
          <section className={classes.text}>{props.title}</section>
          <ReturnButton onClick={toggle} className={classes["return-button"]} />
        </section>
        <Border />
        <section className={classes.content}>
          {props.children}
        </section>
      </section>
      <section className={`${classes.overlay} ${hidden ? '' : classes.active}`}
        onClick={() => toggle()} />
    </section>
    <span
      className={classes['entry-text']}
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