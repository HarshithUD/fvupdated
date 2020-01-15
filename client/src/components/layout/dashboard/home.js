import React, { Component } from 'react'
import Sidebar from './components/sidebar'
import UserDetails from './components/userdetails'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../../actions/authActions";

class home extends Component {
  componentDidMount(){
    document.body.style.backgroundColor = "#fff";
  }
    
    render() {
        const { user } = this.props.auth;
        return (
            <div className="page-wrapper chiller-theme toggled">
            <Sidebar user={user} />
            <main className="page-content">
                <div className="referralId">
                  
                </div>
                <div className="container-fluid">
                <UserDetails user={user}/>
                </div>
            </main>
            </div>
        )
    }
}

home.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
  };
  const mapStateToProps = state => ({
    auth: state.auth
  });
  export default connect(
    mapStateToProps,
    { logoutUser }
  )(home);