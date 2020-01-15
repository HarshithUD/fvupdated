import React, { Component } from 'react'
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { changePass } from "../../../actions/authActions";
import classnames from "classnames";
import Swal from 'sweetalert2'
import OtpInput from 'react-otp-input'
import Axios from 'axios'
import { Redirect } from 'react-router-dom'

class ForgotPass extends Component {
    constructor(props){
        super(props);
        this.state = {
            mobile: "",
            password: "",
            errors: {},
            otp: '',
            numInputs: 4,
            separator: '-',
            isDisabled: false,
            hasErrored: false,
            isInputNum: true,
            type:'forgotpass',
            redirect: false,
            token:'',
            id:''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        document.body.style.backgroundColor = "#4a156b";
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

    setRedirect = () => {
        this.setState({
          redirect: true
        })
      }

    handleChange = (e) => {
        const target = e.target;
        const value = target.value;
        const id = target.id;
        if(id==='mobile'){
            if(value.length <= 10){
                this.setState({
                    [id]: value
                })
            }
        }
        else{
        this.setState({
            [id]: value
        })
        }
    }

    handleOtpChange = otp => {
        this.setState({ otp });
      };

    checkOtp = e => {
        e.preventDefault();
        var otpData = {
            otp: this.state.otp,
            number: this.state.mobile,
            type: this.state.type,
        };
        Axios.post('/api/verify/checkOtp',otpData)
        .then(async result => {
            if(result.data.error){
                document.getElementById('otpNo').innerHTML = result.data.message;
            }
            else{
                this.setState({
                    token:result.data.token,
                    id:result.data.id,
                })
                this.closeModal();
                // await this.setRedirect();
                this.props.history.push("/new-password?token="+this.state.token+"&id="+this.state.id);
            }
        })
    }

    closeModal = (e) => {
        document.getElementById('ModalCenter').classList.remove('show','d-block');
    }

    handleSubmit = (e) => {
        e.preventDefault();
        
        const userData = {
            mobile: this.state.mobile,
            type:this.state.type
        };
        Swal.fire({
          title: "Please Wait...",
          allowOutsideClick: false
        })
        Swal.showLoading();
        this.props.changePass(userData); // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
    }

    render() {
        if (this.state.redirect) {
            return <Redirect  to={{pathname:'/new-password',state:{token:this.state.token}}} />
        }
        const { errors } = this.state;
        const { otp, numInputs, separator, isDisabled, hasErrored, isInputNum } = this.state;
        return (
            <div className="container">
            <div className="row">
            <div className="pr-0 ml-auto mr-auto custom-log">
                <div className="log-in-form-wrapper mt-3">
                    <form autoComplete='off' noValidate onSubmit={this.handleSubmit} >
                        <h2 className="pb-3">Forgot Password</h2>
                        <div className="form-group">
                          <label htmlFor="mobile">Enter Mobile Number</label>
                          <input type="text" autoComplete={'off'} id="mobile" aria-describedby="emailHelp" placeholder="Mobile" onChange={this.handleChange} value={this.state.mobile} error={errors.email} className={classnames("form-control ", {invalid: errors.email || errors.emailNotFound })} />
                          <span className="red-text">
                            {errors.email}
                            <div dangerouslySetInnerHTML={{__html: errors.emailNotFound}} />
                          </span>
                        </div>
                        <button type="submit" className="btn btn-primary btn-login">Submit</button>
                    </form>
                </div>
            </div>
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
                        <OtpInput
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
                            <button type="button" className="btn btn-primary" onClick={this.checkOtp}>Submit</button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

ForgotPass.propTypes = {
    changePass: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
  };
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});
export default connect(
  mapStateToProps,
  { changePass }
)(withRouter(ForgotPass));