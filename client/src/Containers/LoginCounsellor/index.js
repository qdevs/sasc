import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Form from './../../Components/Auth/SigninCounsellor';
import * as actions from '../../Redux/Actions/authActions';
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
            <div className="alert alert-danger">
                {this.props.errorMessage}
            </div>
        );
    }
  }

  render() {
    return (
      <div className="Login">
        <h2>Login</h2>
        <Form
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
    errorMessage: PropTypes.string
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

export default connect(mapStateToProps, actions)(LoginCounsellor);