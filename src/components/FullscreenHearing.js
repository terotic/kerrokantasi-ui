import React from 'react';
import PropTypes from 'prop-types';
import {intlShape} from 'react-intl';
import FullscreenPlugin from './FullscreenPlugin';
import {getHearingURL, getMainSection} from '../utils/hearing';
import {Hearing, wrapHearingComponent} from './Hearing';
import getAttr from '../utils/getAttr';


class FullscreenHearing extends Hearing {

  render() {
    const hearing = this.props.hearing;
    const user = this.props.user;
    const mainSection = getMainSection(hearing);
    const {language} = this.context;

    return (
      <div id="hearing">
        {mainSection ? <FullscreenPlugin
          canComment={this.isMainSectionCommentable(user)}
          canVote={this.isMainSectionVotable(user)}
          comments={this.props.sectionComments[mainSection.id]}
          detailURL={getHearingURL(hearing, {fullscreen: false})}
          headerTitle={getAttr(hearing.title, language)}
          onPostComment={this.onPostSectionComment.bind(this)}
          onPostVote={this.onVoteComment.bind(this)}
          section={mainSection}
          user={user}
        /> : null}
      </div>
    );
  }
}

FullscreenHearing.propTypes = {
  dispatch: PropTypes.func,
  hearing: PropTypes.object,
  hearingId: PropTypes.string,
  intl: intlShape.isRequired,
  location: PropTypes.object,
  sectionComments: PropTypes.object,
  user: PropTypes.object,
};

FullscreenHearing.contextTypes = {
  language: PropTypes.string
};

export default wrapHearingComponent(FullscreenHearing);
