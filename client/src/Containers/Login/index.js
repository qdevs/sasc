import React, { Component } from 'react';
import Form from './../../Components/Form/';
import './styles.css';

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      age: null,
      gender: null,
      phoneNumber: null,
      password: null
    };
     this.handleOnChange = this.handleOnChange.bind(this);
     this.handleOnSubmit = this.handleOnSubmit.bind(this)
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
    console.log(this.state);
  }

  render() {
    return (
      <div className="Login">
        <h2>Login</h2>
        <Form
          age
          gender
          onSubmit={this.handleOnSubmit}
          onChange={this.handleOnChange}
        />
      </div>
    );
  }
}

export default Login;