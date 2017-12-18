import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import Form from './../../Components/Form';
import * as authActions from '../../Redux/Actions/authActions';
import PropTypes from 'prop-types';
import './styles.css';

class LoginCounsellor extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      email: null,
      password: null
    };
     this.handleOnChange = this.handleOnChange.bind(this);
     this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  componentWillMount() {
    this.props.removeError();
  }

  handleOnChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    }); 
  }

  handleOnSubmit(ev) {
    ev.preventDefault();

    const { history } = this.props;

    this.props.signinCounsellor(this.state, history);
  }

  renderAlert() {
    if (this.props.errorMessage) {
        return (
            <div>
                {this.props.errorMessage}
            </div>
        );
    }
  }

  render() {
    return (
      <div className="LoginCounsellor">
        <h2>Login</h2>
        <Form
          email
          password
          onSubmit={this.handleOnSubmit}
          onChange={this.handleOnChange}
        />
        {this.renderAlert()}
      </div>
    );
  }
}

LoginCounsellor.propTypes = {
    signinCounsellor: PropTypes.func,
    history: PropTypes.object,
    errorMessage: PropTypes.string,
    removeError: PropTypes.func
};

function mapStateToProps(state) {
    const { email, password } = state;
    state.form = {
      email,
      password
    };
    return {
      form: state.form,
      errorMessage: state.auth.error
    };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ signinCounsellor: authActions.signinCounsellor, removeError: authActions.removeError }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginCounsellor);