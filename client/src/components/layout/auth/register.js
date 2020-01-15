import React, { Component } from 'react'
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../../../actions/authActions";
import classnames from "classnames";
import Swal from 'sweetalert2'
import Axios from 'axios';
import OtpInput from 'react-otp-input'

class Register extends Component {
    constructor(props){
        super(props);
        this.state = {
            name:'',
            remail:'',
            mobile:'',
            rpassword:'',
            password2:'',
            errors: {},
            otp: '',
            numInputs: 4,
            separator: '-',
            isDisabled: false,
            hasErrored: false,
            isInputNum: true,
            type:'register',
            referrer:''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        // If logged in and user navigates to Register page, should redirect them to dashboard
        if (this.props.auth.isAuthenticated ) {
            this.props.history.push("/dashboard");
        }
      }


    componentWillReceiveProps(nextProps) {
        if (nextProps.errors) {
          this.setState({
            errors: nextProps.errors
          });
        }
      }

    handleChange = (e) => {
        const target = e.target;
        const id = target.id;
        const value = target.value;
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

    closeModal = (e) => {
        document.getElementById('RegOtp').classList.remove('show','d-block');
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
        Axios.post('/api/verify/mobile',otpData)
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

    handleSubmit = (e) => {
        e.preventDefault();
        const NewUser = {
            name: this.state.name,
            remail: this.state.remail,
            mobile: this.state.mobile,
            rpassword: this.state.rpassword,
            password2: this.state.password2,
            referrer:this.state.referrer
        };

        Swal.fire({
            title: "Please Wait...",
            allowOutsideClick: false
        })
        Swal.showLoading();
        this.props.registerUser(NewUser, this.props.history); 
    }

    render() {
        const { errors } = this.state;
        const { otp, numInputs, separator, isDisabled, hasErrored, isInputNum } = this.state;
        return (
            <div className="col-md-6 custom regForm">
                <div className="sign-up-form-wrapper mt-3">
                    <form noValidate onSubmit={this.handleSubmit}>
                        <h2>Register</h2>
                        <div className="form-group">
                            <label htmlFor="name">Your Name</label>
                            <input type="text" id="name" placeholder="Your Name" onChange={this.handleChange} value={this.state.name} error={errors.name} className={ classnames("form-control ", { invalid: errors.name }) } />
                            <span className="red-text">{errors.name}</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="mobile">Mobile Number</label>
                            <input type="text" id="mobile" placeholder="Mobile Number" onChange={this.handleChange} value={this.state.mobile} error={errors.mobile} className={ classnames("form-control ", { invalid: errors.mobile }) } />
                            <span className="red-text">{errors.mobile}</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="remail">Email</label>
                            <input type="email" id="remail" placeholder="Email Address" onChange={this.handleChange} value={this.state.remail} error={errors.remail} className={ classnames("form-control ", { invalid: errors.remail }) } />
                            <span className="red-text">{errors.remail}</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="referrer">Referral ID</label>
                            <input type="text" id="referrer" placeholder="Enter Referral ID" onChange={this.handleChange} value={this.state.referrer} error={errors.referrer} className={ classnames("form-control ", { invalid: errors.referrer }) } />
                            <span className="red-text">{errors.referrer}</span>
                        </div>
                        <div className="form-group">
                                <label htmlFor="rpassword">Password</label>
                                <input type="password" id="rpassword"  placeholder="******" onChange={this.handleChange} value={this.state.rpassword} error={errors.rpassword} className={ classnames("form-control ", { invalid: errors.rpassword }) } />
                                <span className="red-text">{errors.rpassword}</span>
                                </div>
                        <div className="form-group">
                            <label htmlFor="password2">Confirm Password</label>
                            <input type="password" id="password2"  placeholder="******" onChange={this.handleChange} value={this.state.password2} error={errors.password2} className={ classnames("form-control ", { invalid: errors.password2 }) } />
                            <span className="red-text">{errors.password2}</span>
                        </div>
                            <div dangerouslySetInnerHTML={{__html: errors.otpError}} />
                        <button type="submit" className="btn btn-primary btn-register">Submit</button>
                    </form>
                </div>
                {/* Modal */}
                <div className="modal fade" id="RegOtp">
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

Register.propTypes = {
    registerUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
  };

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
  });

export default connect(
    mapStateToProps,
    { registerUser }
) (withRouter(Register));