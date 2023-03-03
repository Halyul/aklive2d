import React from 'react';
import PropTypes from 'prop-types';
import './main_border.css';

export default function MainBorder(props) {
  return (
    <section className="main-border">
      {props.children}
    </section>
  )
}
MainBorder.propTypes = {
  children: PropTypes.node,
};