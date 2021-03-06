import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import Form from './../../Components/Form';
import * as smsActions from '../../Redux/Actions/smsActions';
import PropTypes from 'prop-types';
import './styles.css';

class Sms extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      twilioPhoneNumber: "",
      accountSid: "",
      authToken: ""
    };
     this.handleOnChange = this.handleOnChange.bind(this);
     this.handleOnSubmit = this.handleOnSubmit.bind(this);
     this.validateForm = this.validateForm.bind(this);
  }

  componentWillMount() {
    this.props.removeError();
    this.props.getSMSDetails();
  }

  handleOnChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  validateForm(fields) {
    const { email, twilioPhoneNumber, accountSid, authToken } = this.state;

    if (!email || !twilioPhoneNumber || !accountSid || !authToken) {
      this.props.renderSMSError("You must not leave any field blank.");
      return false;
    }

    // TODO: Add regex check for email here.

    return true;
  }

  handleOnSubmit(ev) {
    ev.preventDefault();
    const { email, twilioPhoneNumber, accountSid, authToken } = this.state;
    var fields = {
      email: email.trim(),
      twilioPhoneNumber: twilioPhoneNumber.trim(),
      accountSid: accountSid.trim(),
      authToken: authToken.trim()
    };
    var validated = this.validateForm(fields);
    if (validated) {
      this.props.setSMSDetails(fields);
    }
  }

  renderAlert() {
    if (this.props.errorMessage) {
        return (
            <div className="error">
                {this.props.errorMessage}
            </div>
        );
    }
  }

  render() {
    if (this.props.auth === "counsellor") {
      return (
        <div className="Sms">
          <h2>SMS Settings</h2>
          <div className="sms-box">
            <h4>Current Settings</h4>
            <div>
              <p>Email: {this.props.sms.email}</p>
            </div>
            <div>
              <p>Twilio Phone Number: {this.props.sms.twilioPhoneNumber}</p>
            </div>
            <div>
              <p>Twilio Account SID: {this.props.sms.accountSid}</p>
            </div>
            <div>
              <p>Twilio Auth Token: {this.props.sms.authToken}</p>
            </div>
          </div>
          <div className="sms-form">
            <h4>Change Twilio Account Info</h4>
            <Form
              twilioEmail
              twilioPhoneNumber
              accountSid
              authToken
              button="Update"
              onSubmit={this.handleOnSubmit}
              onChange={this.handleOnChange}
            />
            {this.renderAlert()}
            <div>
              <button id="sms-delete" onClick={this.props.removeSMSDetails}>Remove Settings</button>
            </div>
          </div>
        </div>
      );
    } else {
      return (<div className="Sms">Unauthorized</div>);
    }
    
  }
}

Sms.propTypes = {
    auth: PropTypes.string,
    getSMSDetails: PropTypes.func,
    setSMSDetails: PropTypes.func,
    removeSMSDetails: PropTypes.func,
    history: PropTypes.object,
    removeError: PropTypes.func,
    renderSMSError: PropTypes.func,
    sms: PropTypes.object,
    errorMessage: PropTypes.string
};

function mapStateToProps(state) {
  return {
    sms: state.sms.sms,
    errorMessage: state.sms.status.error,
    auth: state.auth.auth
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getSMSDetails: smsActions.getSMSDetails,
    setSMSDetails: smsActions.setSMSDetails,
    removeSMSDetails: smsActions.removeSMSDetails,
    renderSMSError: smsActions.renderSMSError,
    removeError: smsActions.removeError
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Sms);