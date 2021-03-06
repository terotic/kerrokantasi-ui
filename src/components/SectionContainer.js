import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Button, Row, Col} from 'react-bootstrap';
import {injectIntl, intlShape, FormattedMessage} from 'react-intl';
import DeleteModal from './DeleteModal';
import {
  followHearing,
  postSectionComment, postVote, editSectionComment,
  deleteSectionComment
} from '../actions';
// import HearingImageList from './HearingImageList';
import WrappedSection from './Section';
// import SectionList from './SectionList';
import Header from '../views/Hearing/Header';
import Sidebar from '../views/Hearing/Sidebar';
import Icon from '../utils/Icon';
import {
  acceptsComments,
  getClosureSection,
  getHearingURL,
  getMainSection,
} from '../utils/hearing';
import {
  getSectionURL,
  groupSections,
  isSpecialSectionType,
  userCanComment,
  userCanVote
} from '../utils/section';
import getAttr from '../utils/getAttr';

const LinkWrapper = ({disabled, to, children, ...rest}) => {
  if (disabled) {
    return (
      <a href="" {...rest} onClick={(ev) => ev.preventDefault()}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} {...rest}>
      {children}
    </Link>
  );
};

LinkWrapper.propTypes = {
  disabled: PropTypes.bool,
  children: PropTypes.elements,
  to: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.func
  ])
};


class SectionContainer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {showDeleteModal: false};
  }

  onPostSectionComment(sectionId, sectionCommentData) {
    const {dispatch} = this.props;
    const hearingSlug = this.props.hearingSlug;
    const {authCode} = this.props.location.query;
    const commentData = Object.assign({authCode}, sectionCommentData);
    dispatch(postSectionComment(hearingSlug, sectionId, commentData));
  }

  onVoteComment(commentId, sectionId) {
    const {dispatch} = this.props;
    const hearingSlug = this.props.hearingSlug;
    dispatch(postVote(commentId, hearingSlug, sectionId));
  }

  onFollowHearing() {
    const {dispatch} = this.props;
    const hearingSlug = this.props.hearingSlug;
    dispatch(followHearing(hearingSlug));
  }

  getFollowButton() {
    if (this.props.user === null) {
      return null;
    }
    return (
      <span className="pull-right">
        <Button bsStyle="primary" onClick={this.onFollowHearing.bind(this)}>
          <Icon name="bell-o"/> <FormattedMessage id="follow"/>
        </Button>
      </span>
    );
  }

  getClosureInfo(hearing) {
    const {formatMessage} = this.props.intl;
    const closureInfo = getClosureSection(hearing);
    if (closureInfo) {
      return closureInfo;
    }
    // Render default closure info if no custom section is specified
    return ({ type: "closure-info",
      title: "",
      abstract: "",
      images: [],
      content: formatMessage({id: 'defaultClosureInfo'}) }
    );
  }

  isSectionVotable(section, user) {
    const hearing = this.props.hearing;
    return acceptsComments(hearing) && userCanVote(user, section);
  }

  isSectionCommentable(section, user) {
    const hearing = this.props.hearing;
    return (
      acceptsComments(hearing)
      && userCanComment(user, section)
      && !section.plugin_identifier // comment box not available for sections with plugins
    );
  }

  onEditSectionComment(sectionId, commentId, commentData) {
    const {dispatch} = this.props;
    const hearingSlug = this.props.hearingSlug;
    const {authCode} = this.props.location.query;
    Object.assign({authCode}, commentData);
    dispatch(editSectionComment(hearingSlug, sectionId, commentId, commentData));
  }

  onDeleteComment() {
    const {dispatch} = this.props;
    const {sectionId, commentId} = this.state.commentToDelete;
    const hearingSlug = this.props.hearingSlug;
    dispatch(deleteSectionComment(hearingSlug, sectionId, commentId));
    this.forceUpdate();
  }

  handleDeleteClick(sectionId, commentId) {
    this.setState({ commentToDelete: {sectionId, commentId}});
    this.openDeleteModal();
  }

  openDeleteModal() {
    this.setState({ showDeleteModal: true });
  }

  closeDeleteModal() {
    this.setState({ showDeleteModal: false, commentToDelete: {} });
  }

  getQuestionLinksAndStuff(sectionGroups) {
    const {hearing: {slug: hearingSlug}, section: {id: sectionId}} = this.props;
    const questions =
      sectionGroups.reduce((questionsArray, currentSection) =>
      [...questionsArray, ...currentSection.sections], []);
    const currentIndex = questions.findIndex((question) => question.id === sectionId);
    const prevPath =
      currentIndex !== 0 ? getSectionURL(hearingSlug, questions[currentIndex - 1]) : undefined;
    const nextPath =
      currentIndex !== questions.length - 1 ? getSectionURL(hearingSlug, questions[currentIndex + 1]) : undefined;
    const prevType =
      currentIndex !== 0 ? questions[currentIndex - 1].type_name_singular : undefined;
    const nextType =
      currentIndex !== questions.length - 1 ? questions[currentIndex + 1].type_name_singular : undefined;

    return {
      currentNum: currentIndex + 1,
      totalNum: questions.length,
      prevPath,
      nextPath,
      prevType,
      nextType
    };
  }

  render() {
    const {hearing, hearingSlug, section, user, sectionComments, language, dispatch} = this.props;
    // const hearingAllowsComments = acceptsComments(hearing);
    const closureInfoSection = this.getClosureInfo(hearing);
    // const regularSections = hearing.sections.filter((section) => !isSpecialSectionType(section.type));
    const mainSection = getMainSection(hearing);
    const regularSections = hearing.sections.filter((sect) => !isSpecialSectionType(sect.type));
    const sectionGroups = groupSections(regularSections);
    const sectionNav = this.getQuestionLinksAndStuff(sectionGroups);
    const isQuestionView = true;
    const showPluginInline = Boolean(!section.plugin_fullscreen && section.plugin_identifier);
    // const fullscreenMapPlugin = hasFullscreenMapPlugin(hearing);
    return (
      <div className="hearing-wrapper section-container">
        <div className="text-right">
          {this.getFollowButton()}
        </div>
        <Header
          hearing={hearing}
          activeLanguage={language}
        />
        <Row>
          <Sidebar
            activeSection={section}
            currentlyViewed={section.id}
            hearing={hearing}
            isQuestionView={isQuestionView}
            mainSection={mainSection}
            sectionGroups={sectionGroups}
            dispatch={dispatch}
            activeLanguage={language}
          />
          <Col md={8} lg={9}>
            {hearing.closed ? <WrappedSection section={closureInfoSection} canComment={false}/> : null}
            <div className="section-browser">
              <ul className="pager">
                {!sectionNav.prevPath
                  ? <li className="previous">
                    <Link to={getHearingURL(hearing)}>
                      <FormattedMessage id="hearing"/>
                    </Link>
                  </li>

                  : <li className="previous">
                    <LinkWrapper
                      disabled={!sectionNav.prevPath}
                      to={sectionNav.prevPath || '#'}
                    >
                      <span aria-hidden>&larr; </span>
                      <FormattedMessage id="previous"/>&nbsp;
                      <span className="type-name hidden-xs">
                        {getAttr(sectionNav.prevType || section.type_name_singular, language)}
                      </span>
                    </LinkWrapper>
                  </li>
                }

                <li className="pager-counter">
                  ({sectionNav.currentNum}/{sectionNav.totalNum})
                </li>
                <li
                  className={`next ${sectionNav.nextPath ? '' : 'disabled'}`}
                >
                  <LinkWrapper
                    disabled={!sectionNav.nextPath}
                    to={sectionNav.nextPath || '#'}
                  >
                    <FormattedMessage id="next"/>&nbsp;
                    <span className="type-name hidden-xs">
                      {getAttr(sectionNav.nextType || section.type_name_singular, language)}
                    </span>
                    <span aria-hidden> &rarr;</span>
                  </LinkWrapper>
                </li>
              </ul>
            </div>
            <WrappedSection
              section={section}
              hearingSlug={hearingSlug}
              canComment={this.isSectionCommentable(section, user)}
              onPostComment={this.onPostSectionComment.bind(this)}// this.props.onPostComment}
              canVote={this.isSectionVotable(section, user)}// this.props.canVote && userCanVote(user, section)}
              onPostVote={this.onVoteComment.bind(this)}// this.props.onPostVote}
              comments={sectionComments}// this.props.loadSectionComments}
              handleDeleteClick={this.handleDeleteClick.bind(this)}
              onEditComment={this.onEditSectionComment.bind(this)}
              user={user}
              isCollapsible={false}
              showPlugin={showPluginInline}
            />
          </Col>
        </Row>
        <DeleteModal
          isOpen={this.state.showDeleteModal}
          close={this.closeDeleteModal.bind(this)}
          onDeleteComment={this.onDeleteComment.bind(this)}
        />
      </div>
    );
  }
}

/* eslint-disable react/forbid-prop-types */
SectionContainer.propTypes = {
  intl: intlShape.isRequired,
  dispatch: PropTypes.func,
  hearing: PropTypes.object,
  hearingSlug: PropTypes.string,
  location: PropTypes.object,
  user: PropTypes.object,
  section: PropTypes.object,
  sectionComments: PropTypes.object,
  language: PropTypes.string,
};

export function wrapSectionContainer(component, pure = true) {
  const wrappedComponent = connect(null, null, null, {pure})(injectIntl(component));
  // We need to re-hoist the data statics to the wrapped component due to react-intl:
  wrappedComponent.canRenderFully = component.canRenderFully;
  wrappedComponent.fetchData = component.fetchData;
  return wrappedComponent;
}

export default wrapSectionContainer(SectionContainer);
