import React from 'react';
import PropTypes from 'prop-types';

export default function CharIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={props.viewBox} style={props.style}>
      {
        props.type === 'operator' ?
          <g><path d="M89 17.5 30.4 57 24.3 71.4 82.9 32.6Z"></path><path d="M0 17.5 58.6 57 64.7 71.4 6.1 32.7Z"> </path><path d="M89 0 30.4 39.5 24.3 53.9 82.9 15.1Z"> </path><path d="M0 0 58.6 39.5 64.7 53.9 6.1 15.2Z"> </path></g>
          :
          <path d="M90.4 50.6l-39.8-23.5v-4c0-4.5-5-6.5-5-6.5a5.4 5.4 0 012.2-10.1c2.7 0 5.3 1.5 5.5 4.8.4 5.3 6.4 3.9 6.4-.3a11.7 11.7 0 00-12-11c-9 0-11.6 8.8-11.6 11.6a11.5 11.5 0 001.6 6.2c2.2 3.8 6.6 4.3 6.6 6.8v2.5L4.2 50.7c-4 2.3-4.7 7.3-3.8 10.3a9.1 9.1 0 009.1 6.4h75.2c5.9 0 8.6-3.4 9.5-6.3C95 58.1 95 53.4 90.4 50.6Zm-5.6 10.3h-75.2c-2.4.1-4-3.3-1.5-4.8l39.2-22.9 39 22.8A2.7 2.7 0 0184.7 60.8Z" />
      }
    </svg>
  )
}

CharIcon.propTypes = {
  viewBox: PropTypes.string,
  type: PropTypes.string,
};