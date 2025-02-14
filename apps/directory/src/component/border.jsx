import PropTypes from 'prop-types'
import classes from './scss/border.module.scss'

export default function Border(props) {
    return <section className={classes.border}>{props.children}</section>
}
Border.propTypes = {
    children: PropTypes.node,
}
