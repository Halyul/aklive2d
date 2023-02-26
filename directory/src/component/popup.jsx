import {
  useState,
  useEffect
} from 'react'
import './popup.css'
import ReturnButton from '@/component/return_button';

export default function Popup(props) {
  const [hidden, setHidden] = useState(true)

  const toggle = () => {
    setHidden(!hidden)
  }

  return (
    <>
      <section className={`popup ${hidden ? '' : 'active'}`}>
        <section className='wrapper'>
          <section className='title'>
            <span>{props.title}</span>
            <ReturnButton onClick={toggle} className="return-button"/>
          </section>
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
    </>
  )
}