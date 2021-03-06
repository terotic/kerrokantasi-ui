import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';
import {injectIntl, FormattedMessage} from 'react-intl';

import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Col from 'react-bootstrap/lib/Col';
import Icon from '../../utils/Icon';

import {canEdit, isOpen} from '../../utils/hearing';
import {hearingShape, userShape} from '../../types';


const DATE_FORMAT = "LLLL";


class HearingToolbar extends React.Component {

  constructor(props) {
    super(props);
    moment.locale("fi-FI");
  }

  render() {
    const user = this.props.user;
    const hearing = this.props.hearing;
    if (!canEdit(user, hearing)) {
      return null;
    }

    let statusLabel = "";
    const openingTime = moment(hearing.open_at);
    const actions = [
      <Button bsStyle="default" onClick={this.props.onEdit} key="edit">
        <Icon name="pencil-square-o"/> <FormattedMessage id="editHearing"/>
      </Button>
    ];
    const open = isOpen(hearing);
    if (open && hearing.published) {
      statusLabel = <FormattedMessage id="published"/>;
      actions.push(
        <Button bsStyle="danger" onClick={this.props.onRevertPublishing} key="unpublish">
          <Icon name="eye-slash"/> <FormattedMessage id="revertPublishing"/>
        </Button>
      );
      actions.push(
        <Button bsStyle="danger" onClick={this.props.onCloseHearing} key="close">
          <Icon name="ban"/> <FormattedMessage id="closeHearing"/>
        </Button>
      );
    } else if (!open && hearing.published && moment(hearing.close_at) <= moment()) {
      statusLabel = <FormattedMessage id="closedHearing"/>;
    } else if (!open && hearing.published) {
      statusLabel = (
        <span>
          <Icon name="clock-o"/> <FormattedMessage id="toBePublishedHearing"/> {openingTime.format(DATE_FORMAT)}
        </span>
      );
      actions.push(
        <Button bsStyle="danger" onClick={this.props.onRevertPublishing} key="unpublish">
          <Icon name="eye-slash"/> <FormattedMessage id="revertPublishing"/>
        </Button>
      );
    } else {
      statusLabel = <FormattedMessage id="draft"/>;
      let publishText = <FormattedMessage id="publishHearing"/>;
      if (moment(hearing.open_at).diff(moment()) < 0) {
        publishText = <FormattedMessage id="publishHearingNow"/>;
      }
      actions.push(
        <Button bsStyle="danger" onClick={this.props.onPublish} key="publish">
          <Icon name="eye"/> {publishText}
        </Button>
      );
    }

    return (
      <div className="toolbar-bottom">
        <Col md={2} mdOffset={5}>
          <span className="status-label">{statusLabel}</span>
        </Col>
        <Col md={5}>
          <ButtonToolbar className="actions pull-right">
            {actions}
          </ButtonToolbar>
        </Col>
      </div>
    );
  }
}

HearingToolbar.propTypes = {
  hearing: hearingShape,
  onCloseHearing: PropTypes.func,
  onEdit: PropTypes.func,
  onPublish: PropTypes.func,
  onRevertPublishing: PropTypes.func,
  user: userShape,
};

const WrappedHearingToolbar = injectIntl(HearingToolbar);

export default WrappedHearingToolbar;
