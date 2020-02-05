import React, { Component } from 'react'
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../../../actions/authActions";
import $ from 'jquery'
import Axios from 'axios';

class sidebar extends Component {
  constructor(props){
    super(props);
    this.state = {
      userLevel:''
    }
  }

    async componentDidMount(){
      await this.getName(this.props.user.id);
        $(".sidebar-dropdown > a").click(function(e) {
            e.preventDefault();
            $(".sidebar-submenu").slideUp(200);
            if (
              $(this).parent().hasClass("active")
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
          if(window.screen.width>768){
          $("#close-sidebar").click(function(e) {
            e.preventDefault();
            $(".page-wrapper").removeClass("toggled");
          });
          $("#show-sidebar").click(function(e) {
            e.preventDefault();
            $(".page-wrapper").addClass("toggled");
        });
		  }
		  else{
			  $("#close-sidebar").click(function(e) {
            e.preventDefault();
            $(".page-wrapper").addClass("toggled");
          });
          $("#show-sidebar").click(function(e) {
            e.preventDefault();
            $(".page-wrapper").removeClass("toggled");
        });
		  }
    }

    onLogoutClick = e => {
      e.preventDefault();
      this.props.logoutUser();
    };

    getName = (id) => {
      Axios.get('/api/users/getDetails/'+id).then(
        res => {
          console.log(res.data);
          this.setState({
            userLevel:res.data.level
          })
        }
      )
    }
    
    render() {
        return (
        <React.Fragment>
        <Link id="show-sidebar" className="btn btn-sm btn-dark" to="">
            <i className="fas fa-bars"></i>
        </Link>
          <nav id="sidebar" className="sidebar-wrapper">
            <div className="sidebar-content">
              <div className="sidebar-brand">
                <Link to=''>Dashboard</Link>
                <div id="close-sidebar">
                  <i className="fas fa-times"></i>
                </div>
              </div>
              <div className="sidebar-header">
                <div className="user-pic">
                  <img className="img-responsive img-rounded" src="https://raw.githubusercontent.com/azouaoui-med/pro-sidebar-template/gh-pages/src/img/user.jpg"
                    alt="User Profile" />
                </div>
                <div className="user-info">
                  <span className="user-name">
                    <strong>{this.props.user.name}</strong>
                  </span>
                  <span className="badge badge-secondary user-role" style={{fontSize:'13px',fontWeight:'400'}}>{this.state.userLevel}</span>
                  <span className="user-status">
                    <i className="fa fa-circle"></i>
                    <span>Online</span>
                  </span>
                </div>
              </div>
              <div className="sidebar-menu">
                <ul>
                  {/* <li className="header-menu">
                    <span></span>
                  </li> */}
                  <li>
                    <Link to='/dashboard'>
                      <i className="fa fa-user-circle"></i>
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                  </li>
                  <li>
                    <Link to='/wallet'>
                    <i className="fa fa-rupee-sign"></i>
                      <span>Wallet</span>
                    </Link>
                  </li>
                  <li>
                    <Link to='/downline-tree'>
                      <i className="fa fa-tree"></i>
                      <span>My Downline Tree</span>
                    </Link>
                  </li>
                  <li>
                    <Link to='/dashboard'>
                        <i className="fa fa-question-circle"></i>
                        <span>Help</span>
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

sidebar.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps,
  { logoutUser }
)(sidebar);