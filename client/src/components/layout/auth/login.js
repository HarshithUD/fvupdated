import React, { Component } from 'react'
import PropTypes from "prop-types";
import { withRouter,Link } from "react-router-dom";
import { connect } from "react-redux";
import { loginUser,LogOtp } from "../../../actions/authActions";
import classnames from "classnames";
import Swal from 'sweetalert2';
import OtpInput2 from 'react-otp-input'
import Axios from 'axios';

class Login extends Component {
    constructor(props){
        super(props);
        this.state = {
            email: "",
            password: "",
            errors: {},
            canClick: false,
            otp: '',
            numInputs: 4,
            separator: '-',
            isDisabled: false,
            hasErrored: false,
            isInputNum: true,
            type:'register'
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
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

      closeModal = (e) => {
        document.getElementById('ModalCenter').classList.remove('show','d-block');
    }


      handleOtpChange = otp => {
        this.setState({ otp });
      };
    
    VerifyOtp = () => {
      Swal.fire({
        title: "Please Wait...",
        allowOutsideClick: false
      })
      Swal.showLoading();
      const logData = {
        email: this.state.email,
        type:this.state.type
    };
      this.props.LogOtp(logData);
    }

    checkOtp2 = e => {
      e.preventDefault();
      var otpData = {
          otp: this.state.otp,
          email: this.state.email,
          type: this.state.type,
      };
      Axios.post('/api/verify/mobilex',otpData)
      .then(result => {
          if(result.data.error){
              document.getElementById('otpNo').innerHTML = result.data.message;
          }
          else{
              this.closeModal();
              Swal.fire(
                  'Registration Success!',
                  'Please Login to continue',
                  'success'
              )
          }
      })
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
            email: this.state.email,
            password: this.state.password,
        };
        Swal.fire({
          title: "Please Wait...",
          allowOutsideClick: false
        })
        Swal.showLoading();
        this.props.loginUser(userData); // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
    }

    render() {
      const { otp, numInputs, separator, isDisabled, hasErrored, isInputNum } = this.state;
        const { errors } = this.state;
        return (
            <div className="col-md-6 pr-0 custom-log">
                <div className="log-in-form-wrapper">
                    <form autoComplete='off' noValidate onSubmit={this.handleSubmit} >
                        <h2 className="pb-3">Log In</h2>
                        <div className="form-group">
                          <label htmlFor="email">Email Address/Mobile</label>
                          <input type="text" autoComplete={'off'} id="email" aria-describedby="emailHelp" placeholder="Email Address/Mobile" onChange={this.handleChange} value={this.state.email} error={errors.email} className={classnames("form-control ", {invalid: errors.email || errors.emailNotFound })} />
                          <span className="red-text">
                            {errors.email}
                            {errors.emailNotFound}
                            <div onClick={this.state.canClick ? this.VerifyOtp : false} dangerouslySetInnerHTML={{__html: errors.otpNotVerified}} style={{margin:'15px 0'}}/>
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
                        <Link to='/forgot-password' style={{margin: '8px 0',textAlign: 'right',color: '#fff'}}>Forgot Password?</Link>
                        <button type="submit" className="btn btn-primary btn-login">Submit</button>
                    </form>
                </div>
                {/* Modal */}
                <div className="modal fade" id="ModalCenter">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title text-center" id="ModalLongTitle">Please Enter OTP sent to your mobile</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.closeModal} >
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                        <OtpInput2
                            inputStyle={{
                                width: '3rem',
                                height: '3rem',
                                margin: '0 1rem',
                                fontSize: '2rem',
                                borderRadius: 4,
                                border: '1px solid rgba(0,0,0,0.3)',
                            }}
                            numInputs={numInputs}
                            isDisabled={isDisabled}
                            hasErrored={hasErrored}
                            errorStyle="error"
                            onChange={this.handleOtpChange}
                            separator={<span>{separator}</span>}
                            isInputNum={isInputNum}
                            value={otp}
                            shouldAutoFocus
                            containerStyle="otpModal"
                            />
                        </div>
                        <span id="otpNo" class="red-text">{errors.otpNo}</span>
                        <span id="otpYes" class="green-text text-green">{errors.otpYes}</span>
                        <p id="otpWrong" className="red-text"></p>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.closeModal}>Close</button>
                            <button type="button" className="btn btn-primary" onClick={this.checkOtp2}>Submit</button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

Login.propTypes = {
    loginUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
  };
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});
export default connect(
  mapStateToProps,
  { loginUser,LogOtp }
)(withRouter(Login));