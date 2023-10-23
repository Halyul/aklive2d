import React, {
  useEffect,
  useState,
  useCallback
} from 'react';
import PropTypes from 'prop-types';
import classes from './scss/totop_button.module.scss'

export default function ToTopButton(props) {
  const [hidden, setHidden] = useState(true)
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    const handleButton = () => {
      const scrollBarPos = window.scrollY || 0;
      setHidden(!(scrollBarPos > 100))
    }
    window.addEventListener('scroll', handleButton)
    return () => {
      window.removeEventListener('scroll', handleButton)
    }
  }, [])

  const smoothScroll = useCallback(
    (target) => {
      const targetElement = document.querySelector(target);
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
      const startPosition = window.scrollY;
      const distance = targetPosition - startPosition;
      const duration = 1000;
      let start = null;
      window.requestAnimationFrame(step);
      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        window.scrollTo(0, easeInOutCubic(progress, startPosition, distance, duration));
        if (progress < duration) window.requestAnimationFrame(step);
      }
      function easeInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
      }
      setClicked(true)
      setTimeout(() => {
        setClicked(false)
      }, duration)
    }, [])

  return (
    <>
      <section className={`${classes['totop-button']} ${clicked ? classes.clicked : ''} ${hidden ? '' : classes.show} ${props.className ? props.className : ''}`}
        onClick={() => { smoothScroll("#root") }}
      >
        <section className={classes.bar}></section>
        <section className={classes.bar}></section>
        <section className={classes.bar}></section>
        <section className={classes.bar}></section>
      </section>
    </>
  )
}
ToTopButton.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
};