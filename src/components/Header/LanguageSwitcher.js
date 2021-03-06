import React from 'react';
import PropTypes from 'prop-types';
import NavItem from 'react-bootstrap/lib/NavItem';
import Nav from 'react-bootstrap/lib/Nav';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import config from '../../config';
import {setLanguage} from '../../actions';

const LanguageSwitcher = ({dispatch, currentLanguage}, {intl: {formatMessage}}) =>
  <Nav pullRight className="language-switcher actions" id="language">
    {config.languages
      .filter((code) => code !== currentLanguage)
      .map((code) =>
        <NavItem
          href=""
          key={code}
          className="language-switcher__language"
          onClick={() => dispatch(setLanguage(code))}
        >
          {formatMessage({id: `lang-${code}`})}
        </NavItem>)}
  </Nav>;

LanguageSwitcher.contextTypes = {
  intl: intlShape.isRequired
};

LanguageSwitcher.propTypes = {
  dispatch: PropTypes.func,
  currentLanguage: PropTypes.string
};

export default connect()(LanguageSwitcher);
