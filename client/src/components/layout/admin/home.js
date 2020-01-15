import React, { Component } from 'react'
import AdminSidebar from './components/sidebar'
import Dashboard from './components/admindetails'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../../actions/authActions";

class home extends Component {
    componentDidMount(){
        document.body.style.backgroundColor = "#fff";
      }
    render() {
        const { admin } = this.props.admin;
        return (
            <div className="page-wrapper chiller-theme toggled">
            <AdminSidebar adminDetails={admin}/>
            <main className="page-content">
                <div className="container-fluid">
                <Dashboard />
                </div>
            </main>
            </div>
        )
    }
}

home.propTypes = {
    logoutUser: PropTypes.func.isRequired,
  };
  const mapStateToProps = state => ({
    admin: state.auth
  });
  export default connect(
    mapStateToProps,
    { logoutUser }
  )(home);