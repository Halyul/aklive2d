import { useState, useEffect } from 'react';
import './switch.css';

export default function Switch(props) {
  const [on, setOn] = useState(props.on)

  useEffect(() => {
    setOn(props.on)
  }, [props.on])

  return (
    <section
      className={`switch ${on ? 'active' : ''}`}
      onClick={() => props.handleOnClick()}
    >
      <span className='text'>{props.text}</span>
      <section className='icon-wrapper'>
        <span className='icon-line'></span>
        <span className='icon'></span>
      </section>
    </section>
  )
}