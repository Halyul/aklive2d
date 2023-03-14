import React from 'react';
import PropTypes from 'prop-types';
import classes from './main_border.module.scss';

export default function MainBorder(props) {
  return (
    <section className={classes.border}>
      {props.children}
    </section>
  )
}
MainBorder.propTypes = {
  children: PropTypes.node,
};