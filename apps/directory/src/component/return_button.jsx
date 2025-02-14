import PropTypes from 'prop-types';
import classes from './scss/return_button.module.scss'

export default function ReturnButton(props) {

  return (
    <>
      <section className={`${classes['return-button']} ${props.className ? props.className : ''}`}
        onClick={() => props.onClick()}
      >
        <section className={classes.wrapper}>
          <section className={classes["arrow-left"]}></section>
          <section className={classes.bar}></section>
          <section className={classes["arrow-right"]}></section>
        </section>
        <section className={classes.wrapper}>
          <section className={classes["arrow-left"]}></section>
          <section className={classes.bar}></section>
          <section className={classes["arrow-right"]}></section>
        </section>
        <section className={classes.wrapper}>
          <section className={classes["arrow-left"]}></section>
          <section className={classes.bar}></section>
          <section className={classes["arrow-right"]}></section>
        </section>
        <section className={classes.wrapper}>
          <section className={classes["arrow-left"]}></section>
          <section className={classes.bar}></section>
          <section className={classes["arrow-right"]}></section>
        </section>
      </section>
    </>
  )
}
ReturnButton.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
};