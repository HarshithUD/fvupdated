import React, { Component } from 'react'
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { loginAdmin } from "../../../../actions/authActions";
import classnames from "classnames";
import Swal from 'sweetalert2'

class Login extends Component {
    constructor(props){
        super(props);
        this.state = {
            email: "",
            password: "",
            errors: {}
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
      // If logged in and user navigates to Login page, should redirect them to dashboard
      if (this.props.auth.isAuthenticated) {
        this.props.history.push("/admin/dashboard");
      }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuthenticated) {
          this.props.history.push("/admin/dashboard"); // push user to dashboard when they login
        }

    if (nextProps.errors) {
          this.setState({
            errors: nextProps.errors
          });
        }
      }

    handleChange = (e) => {
        const target = e.target;
        const value = target.value;
        const id = target.id;

        this.setState({
            [id]: value
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        
        const userData = {
            name: this.state.email,
            password: this.state.password,
        };
        
        Swal.fire({
          title: "Please Wait...",
          allowOutsideClick: false
        })
        Swal.showLoading();
        this.props.loginAdmin(userData); // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
    }

    render() {
        const { errors } = this.state;
        return (
            <div className="pr-0 ml-auto mr-auto custom-log">
                <div className="log-in-form-wrapper mt-3">
                    <form autoComplete='off' noValidate onSubmit={this.handleSubmit} >
                        <h2 className="pb-3">Log In</h2>
                        <div className="form-group">
                          <label htmlFor="email">UserName</label>
                          <input type="text" autoComplete={'off'} id="email" aria-describedby="emailHelp" placeholder="User email" onChange={this.handleChange} value={this.state.email} error={errors.email} className={classnames("form-control ", {invalid: errors.email || errors.emailNotFound })} />
                          <span className="red-text">
                            {errors.email}
                            {errors.userNotFound}
                          </span>
                        </div>
                        <div className="form-group">
                          <label htmlFor="password">Password</label>
                          <input type="password" id="password" placeholder="Password" onChange={this.handleChange} value={this.state.password} error={errors.password} className={classnames("form-control ", {invalid: errors.password || errors.passwordIncorrect })} />
                          <span className="red-text">
                            {errors.password}
                            {errors.passwordIncorrect}
                          </span>
                        </div>
                        <button type="submit" className="btn btn-primary btn-login">Submit</button>
                    </form>
                </div>
            </div>
        )
    }
}

Login.propTypes = {
    loginAdmin: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
  };
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});
export default connect(
  mapStateToProps,
  { loginAdmin }
)(withRouter(Login));