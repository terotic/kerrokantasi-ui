/**
 * Created by riku on 11.5.2017.
 */
import React from 'react';
import PropTypes from 'prop-types';
import MapdonHKRPlugin from './plugins/legacy/mapdon-hkr';
import MapdonKSVPlugin from './plugins/legacy/mapdon-ksv';
import MapQuestionnaire from './plugins/MapQuestionnaire';
import Alert from 'react-bootstrap/lib/Alert';
import {get} from 'lodash';

export default class PluginContent extends React.Component {

  constructor() {
    super();

    this.state = {
      showLoader: false
    };
  }

  componentDidMount() {
    const {hearingSlug, section} = this.props;
    this.props.fetchAllComments(hearingSlug, section.id);
  }

  componentWillReceiveProps(nextProps) {
    const {hearingSlug, section} = this.props;
    const isFetching = get(nextProps.comments, 'isFetching');
    const results = get(nextProps.comments, 'results');

    this.setState({
      showLoader: isFetching
    });

    if (!isFetching && results && results.length === 0 && section.n_comments !== 0) {
      // comments have to be reloaded due to posting
      this.props.fetchAllComments(hearingSlug, nextProps.section.id, nextProps.comments.ordering);
    }
  }

  render() {
    const {user, section, onPostComment, onPostVote} = this.props;
    const comments = this.props.comments ? this.props.comments.results : [];
    if (typeof window === 'undefined' || !section.plugin_identifier) {
      return <div />;
    }
    switch (section.plugin_identifier) {
      case "mapdon-hkr":
        return (
          <MapdonHKRPlugin
            data={section.plugin_data}
            onPostComment={onPostComment}
          />
        );
      case "mapdon-ksv":
        return (
          <MapdonKSVPlugin
            data={section.plugin_data}
            onPostComment={onPostComment}
            pluginPurpose="postComments"
            canSetNickname={user === null}
          />
        );
      case "map-questionnaire":
        return (
          <MapQuestionnaire
            data={section.plugin_data}
            onPostComment={onPostComment}
            onPostVote={onPostVote}
            comments={comments}
            pluginPurpose="postComments"
            canSetNickname={user === null}
            displayCommentBox={false}
            pluginSource={section.plugin_iframe_url}
          />
        );
      default:
        return <Alert>I do not know how to render the plugin {section.plugin_identifier}</Alert>;
    }
  }
}

PluginContent.propTypes = {
  hearingSlug: PropTypes.string,
  fetchAllComments: PropTypes.func,
  comments: PropTypes.object,
  onPostComment: PropTypes.func,
  onPostVote: PropTypes.func,
  section: PropTypes.object.isRequired,
  user: PropTypes.object
};
