import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as authActions from '../../Redux/Actions/authActions';
import * as userActions from '../../Redux/Actions/userActions';
import * as counsellorActions from '../../Redux/Actions/counsellorActions';
import * as chatActions from '../../Redux/Actions/chatActions';
import * as roomActions from '../../Redux/Actions/roomActions';
import PropTypes from 'prop-types';
import './styles.css';

class Logout extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        this.props.signout();
        this.props.disconnectFromChat();
        this.props.removeUser();
        this.props.removeCounsellor();
        this.props.removeRooms();
        this.props.removeActiveRoom();
    }
    
    render() {
        return (
            <div className="Logout">
                Bye! Click <Link className="nav-link" to="/">here</Link> to go back to the homepage.
            </div>
        );
    }
}

function mapStateToProps(state) {
    return state;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        signout: authActions.signout,
        removeUser: userActions.removeUser,
        removeCounsellor: counsellorActions.removeCounsellor,
        disconnectFromChat: chatActions.disconnectFromChat,
        removeRooms: roomActions.removeRooms,
        removeActiveRoom: roomActions.removeActiveRoom
    }, dispatch);
}

Logout.propTypes = {
    removeUser: PropTypes.func,
    removeCounsellor: PropTypes.func,
    signout: PropTypes.func,
    disconnectFromChat: PropTypes.func,
    removeRooms: PropTypes.func,
    removeActiveRoom: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(Logout);