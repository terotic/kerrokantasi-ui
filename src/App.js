import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import messages from './i18n';
import Helmet from 'react-helmet';
import Header from './components/Header';
import Footer from './components/Footer';
import {retrieveUserFromSession} from './actions';
import config from './config';
import { getUser } from './selectors/user';

class App extends React.Component {
  getChildContext() {
    return {
      language: this.props.language,
      user: this.props.user,
    };
  }

  componentDidMount() {
    this.props.dispatch(retrieveUserFromSession());
    config.activeLanguage = this.props.language; // for non react-intl localizations
  }

  render() {
    const locale = this.props.language;
    const favlinks = [
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/assets/favicon/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/assets/favicon/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/assets/favicon/favicon-16x16.png' },
      { rel: 'manifest', href: '/assets/favicon/manifest.json' },
      { rel: 'mask-icon', href: '/assets/favicon/safari-pinned-tab.svg', color: '#0072c6' },
      { rel: 'shortcut icon', type: 'image/x-icon', href: '/assets/favicon/favicon.ico' }
    ];
    const favmeta = [
      { name: 'msapplication-config', content: '/assets/favicon/browserconfig.xml' },
      { name: 'theme-color', content: '#ffffff' }
    ];
    const fullscreen = this.props.location.query.fullscreen === 'true';
    let header = null;
    if (!fullscreen) {
      header = <Header slim={this.props.location.pathname !== '/'} history={this.props.history} />;
    }
    return (
      <IntlProvider locale={locale} messages={messages[locale] || {}}>
        <div>
          <Helmet
            titleTemplate="%s - Kerro Kantasi"
            link={favlinks}
            meta={favmeta}
            script={[{ src: '/assets/js/piwik.js', type: 'text/javascript' }]}
          />
          {header}
          <main className={fullscreen ? 'fullscreen' : 'main-content'}>
            {this.props.children}
          </main>
          <Footer />
        </div>
      </IntlProvider>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
  history: PropTypes.object,
  language: PropTypes.string,
  location: PropTypes.object,
  user: PropTypes.object,
  dispatch: PropTypes.func,
};
App.childContextTypes = {
  language: PropTypes.string,
  user: PropTypes.object,
};
export default connect(state => ({ user: getUser(state), language: state.language }))(App);
