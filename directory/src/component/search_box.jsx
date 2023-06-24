import React, {
  useState,
} from 'react'
import PropTypes from 'prop-types';
import classes from './scss/search_box.module.scss'
import { useI18n } from '@/state/language';

export default function SearchBox(props) {
  const { i18n } = useI18n()
  const [searchField, setSearchField] = useState('');

  const filterBySearch = (event) => {
    const query = event.target.value;
    props.handleOnChange(query);
    setSearchField(query);
  };

  return (
    <>
      <section className={`${classes['search-box']} ${props.className ? props.className : ''}`}>
        <section className={classes.icon} />
        <section className={classes.icon_dot} />
        <input
          type="text"
          className={classes.input}
          placeholder={i18n(props.altText)}
          onChange={filterBySearch}
          value={searchField} />
        <section
          className={`${classes.icon_clear} ${searchField === '' ? '' : classes.active}`}
          onClick={() => {
            setSearchField('');
            props.handleOnChange('');
          }}
        >
          <section className={classes.line} />
          <section className={classes.line} />
        </section>
      </section>
    </>
  )
}
SearchBox.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string,
  altText: PropTypes.string,
  handleOnChange: PropTypes.func,
  searchField: PropTypes.string,
};