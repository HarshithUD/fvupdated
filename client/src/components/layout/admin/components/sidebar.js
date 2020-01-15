import React, { Component } from 'react'
import { Link } from "react-router-dom";
import { logoutAdmin } from "../../../../actions/authActions";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import $ from 'jquery'

class adminsidebar extends Component {
  constructor(props){
    super(props);
    this.state = {
      adminName:''
    }
  }
    componentDidMount(){
      this.setState({
        adminName: typeof this.props.adminDetails !== 'undefined'? this.props.adminDetails.name : this.props.admin.user.name
      })
        $(".sidebar-dropdown > a").click(function(e) {
            e.preventDefault();
            $(".sidebar-submenu").slideUp(200);
            if (
              $(this).parent().hasclass("active")
            ) {
              $(".sidebar-dropdown").removeClass("active");
              $(this)
                .parent()
                .removeClass("active");
            } else {
              $(".sidebar-dropdown").removeClass("active");
              $(this)
                .next(".sidebar-submenu")
                .slideDown(200);
              $(this)
                .parent()
                .addClass("active");
            }
          });
          
          $("#close-sidebar").click(function(e) {
            e.preventDefault();
            $(".page-wrapper").removeClass("toggled");
          });
          $("#show-sidebar").click(function(e) {
            e.preventDefault();
            $(".page-wrapper").addClass("toggled");
        });
    }

    onLogoutClick = e => {
      e.preventDefault();
      this.props.logoutAdmin();
    };

    render() {
        return (
        <React.Fragment>
        <Link id="show-sidebar" className="btn btn-sm btn-dark" to="">
            <i className="fas fa-bars"></i>
        </Link>
          <nav id="sidebar" className="sidebar-wrapper">
            <div className="sidebar-content">
              <div className="sidebar-brand">
                <Link to="/admin/dashboard">Dashboard</Link>
                <div id="close-sidebar">
                  <i className="fas fa-times"></i>
                </div>
              </div>
              <div className="sidebar-header">
                <div className="user-pic">
                  <img className="img-responsive img-rounded" src="https://raw.githubusercontent.com/azouaoui-med/pro-sidebar-template/gh-pages/src/img/user.jpg"
                    alt="User" />
                </div>
                <div className="user-info">
                  <span className="user-name">
                    <strong>{this.state.adminName}</strong>
                  </span>
                  <span className="user-role">Administrator</span>
                  <span className="user-status">
                    <i className="fa fa-circle"></i>
                    <span>Online</span>
                  </span>
                </div>
              </div>
              <div className="sidebar-menu">
                <ul>
                  <li>
                    <Link to="/admin/settings">
                      <i className="fa fa-cog"></i>
                      <span>Settings</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/activate-users" >
                      <i className="fa fa-plus-circle"></i>
                      <span>Activate Users</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/declined-users">
                      <i className="fa fa-plus-circle"></i>
                      <span>Declined Users</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/approve-users">
                    <i className="fa fa-rupee-sign"></i>
                      <span>Approve users</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/payout-requests">
                      <i className="fa fa-plus-circle"></i>
                      <span>Payout Requests</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/approved-users">
                    <i className="fa fa-rupee-sign"></i>
                      <span>Approved Users</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/payout-eligible">
                        <i className="fa fa-question-circle"></i>
                        <span>Eligible for Payout</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/transaction-details">
                        <i className="fa fa-question-circle"></i>
                        <span>Transaction Details</span>
                    </Link>
                  </li>
                  <li>
                  <Link to="" onClick={this.onLogoutClick}>
                      <i className="fa fa-user-circle"></i>
                      <span>Logout</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          </React.Fragment>
        )
    }
}


adminsidebar.propTypes = {
  logoutAdmin: PropTypes.func.isRequired
};
const mapStateToProps = state => ({
  admin: state.auth
});
export default connect(
  mapStateToProps,
  { logoutAdmin }
)(adminsidebar);