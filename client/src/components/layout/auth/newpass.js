import React, { Component } from 'react'
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { updatePass } from "../../../actions/authActions";
import classnames from "classnames";
import Swal from 'sweetalert2'
import OtpInput from 'react-otp-input'
import Axios from 'axios'
import { Redirect } from 'react-router-dom'

class putPass extends Component {
    constructor(props){
        super(props);
        this.state = {
            password: "",
            password2: "",
            errors: {},
            token:'',
            id:''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        document.body.style.backgroundColor = "#4a156b";
        const query = new URLSearchParams(this.props.location.search);
        const token = query.get('token');
        const id = query.get('id');
        if((token==='')|| (token===null)){
            this.props.history.push("/forgot-password");
        }
        else{
            this.setState({
                token:token,
                id:id
            })
        }
      // If logged in and user navigates to Login page, should redirect them to dashboard
      if (this.props.auth.isAuthenticated ) {
        this.props.history.push("/dashboard");
      }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuthenticated) {
          this.props.history.push("/dashboard"); // push user to dashboard when they login
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
        })
    }

    handleSubmit = (e) => {
        e.preventDefault();
        
        const userData = {
            password: this.state.password,
            password2:this.state.password2,
            token:this.state.token,
            id:this.state.id
        };
        Swal.fire({
          title: "Please Wait...",
          allowOutsideClick: false
        })
        Swal.showLoading();
        this.props.updatePass(userData); // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
    }

    render() {
        const { errors } = this.state;
        return (
            <div className="container">
            <div className="row">
            <div className="pr-0 ml-auto mr-auto custom-log">
                <div className="log-in-form-wrapper mt-3">
                    <form autoComplete='off' noValidate onSubmit={this.handleSubmit} >
                        <h2 className="pb-3">Enter New Password</h2>
                        <div className="form-group">
                          <label htmlFor="password">Enter New Password</label>
                          <input type="password" autoComplete={'off'} id="password" aria-describedby="emailHelp" placeholder="password" onChange={this.handleChange} value={this.state.password} error={errors.email} className={classnames("form-control ", {invalid: errors.email || errors.emailNotFound })} />
                          <span className="red-text">
                            {errors.password}
                          </span>
                        </div>
                        <div className="form-group">
                          <label htmlFor="password2">Confirm Password</label>
                          <input type="password" autoComplete={'off'} id="password2" aria-describedby="emailHelp" placeholder="Confirm password" onChange={this.handleChange} value={this.state.password2} error={errors.email} className={classnames("form-control ", {invalid: errors.email || errors.emailNotFound })} />
                          <span className="red-text">
                            {errors.password2}
                          </span>
                        </div>
                        <button type="submit" className="btn btn-primary btn-login">Submit</button>
                    </form>
                </div>
            </div>
            </div>
            </div>
        )
    }
}

putPass.propTypes = {
    updatePass: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
  };
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});
export default connect(
  mapStateToProps,
  { updatePass }
)(withRouter(putPass));