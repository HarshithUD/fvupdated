import React, { Component } from 'react'
import Axios from 'axios';
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { updateUserDetails } from "../../../../actions/authActions";
import Swal from 'sweetalert2';
import OtpInput from 'react-otp-input'

class userdetails extends Component {
    constructor(props){
        super(props);
        const userprops = this.props.user;
        var sepName = userprops.name.split(" ")[0];
        this.state = {
            firstname: sepName,
            lastname: '',
            email: '',
            mobile: '',
            address: '',
            pan:'',
            bankuser: '',
            bankname: '',
            accnumber: '',
            ifsc: '',
            selfie: null,
            imagePath:'',
            confAccNum: '',
            AccErr: '',
            otp: '',
            numInputs: 4,
            separator: '-',
            isDisabled: false,
            hasErrored: false,
            isInputNum: true,
            type:'profile',
            referralId:''
        }
    }

    componentDidMount(){
		Swal.fire({
            title: "Please Wait...",
            allowOutsideClick: false
		})
		Swal.showLoading();
        const userId = this.props.user.id;
        Axios.get('/api/users/getDetails/'+userId).then(
            res => {
				Swal.close();
                const resData = res.data;
                this.setState({
                    lastname:resData.lastname,
                    email:resData.email,
                    mobile:resData.number,
                    streetaddress:resData.address && resData.address && resData.address.streetaddress,
                    city:resData.address && resData.address.city,
                    state:resData.address && resData.address.state,
                    pincode:resData.address && resData.address.pincode,
                    pan:resData.pan,
                    bankuser:resData.bankuser,
                    bankname:resData.bankname,
                    accnumber:resData.accnumber,
                    ifsc:resData.ifsc,
                    selfie:null,
                    imagePath:resData.imagePath,
                    referralId:resData.referralId
                })
            }
        )
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.errors) {
          this.setState({
            errors: nextProps.errors
          });
        }
        else{
            this.props.history.push("/");
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

    handleOtpChange = otp => {
        this.setState({ otp });
      };

    updateImage = () => {
        Swal.fire({
            title: "Please Wait...",
            allowOutsideClick: false
          })
        Swal.showLoading();
        const userId = this.props.user.id;
        Axios.get('/api/users/getDetails/'+userId).then(
            res => {
                Swal.close();
                const resData = res.data;
                this.setState({
                    lastname:resData.lastname,
                    email:resData.email,
                    streetaddress:resData.address && resData.address && resData.address.streetaddress,
                    city:resData.address && resData.address.city,
                    state:resData.address && resData.address.state,
                    pincode:resData.address && resData.address.pincode,
                    pan:resData.pan,
                    bankuser:resData.bankuser,
                    bankname:resData.bankname,
                    accnumber:resData.accnumber,
                    ifsc:resData.ifsc,
                    imagePath:resData.imagePath
                })
            }
        )
    }

    handleFileChange = (e) => {
        const target = e.target;
        const file = target.files[0];
        const id = target.id;

        this.setState({
            [id]: file
        });
    }

    closeModal = (e) => {
        document.getElementById('ModalCenter').classList.remove('show','d-block');
    }

    checkOtp = e => {
        e.preventDefault();
        var otpData = {
            otp: this.state.otp,
            number: this.state.mobile,
            type: 'updateprofile',
        };
        Axios.post('/api/verify/profile',otpData)
        .then(result => {
            if(result.data.error){
                document.getElementById('otpNo').innerHTML = result.data.message;
            }
            else{
                this.closeModal();
                Swal.fire({
                    title: "Please Wait...",
                    allowOutsideClick: false
                  })
                Swal.showLoading();
                const config = {
                    headers: {
                        'content-type': 'multipart/form-data'
                    }
                };
                const userData = {
                    id: this.props.user.id,
                    firstname: this.state.firstname,
                    lastname:this.state.lastname,
                    email:this.state.email,
                    address:{
                        streetaddress:this.state.streetaddress,
                        city:this.state.city,
                        state:this.state.state,
                        pincode:this.state.pincode,
                    },
                    pan:this.state.pan,
                    bankuser:this.state.bankuser,
                    bankname:this.state.bankname,
                    accnumber:this.state.accnumber,
                    ifsc:this.state.ifsc
                };
                const formData = new FormData();
                var filename = this.props.user.id;
                formData.append('selfie',this.state.selfie);
                formData.append('filename',filename);
                this.props.updateUserDetails(userData,formData,config)
            }
        })
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        if(this.state.accnumber !== this.state.confAccNum){
            document.getElementById("confAccNum").focus();
            this.setState({
                AccErr:'Account Number not matched'
            })
        }
        else{
            this.setState({
                AccErr:''
            })
        Swal.fire({
            title: "Please Wait...",
            allowOutsideClick: false
          })
        Swal.showLoading();
        // var updateData1 = {
        //     number:this.state.mobile,
        //     type:'updateprofile'
        // }
        // Axios.post('/api/verify/genOtp',updateData1)
        // .then(resultData => {
        //     console.log(resultData)
        //     Swal.close();
        //     if(resultData.data.error){
        //         document.getElementById('otpNo').innerHTML = resultData.data.message;
        //     }
        //     else{
        //         document.getElementById('ModalCenter').classList.add('show','d-block');
        //     }
        // })
        // .catch(err => {
        //     console.log(err)
        // }) *** OTP DISABLED
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        };
        const userData = {
            id: this.props.user.id,
            firstname: this.state.firstname,
            lastname:this.state.lastname,
            email:this.state.email,
            mobile:this.state.number,
            address:{
                streetaddress:this.state.streetaddress,
                city:this.state.city,
                state:this.state.state,
                pincode:this.state.pincode,
            },
            pan:this.state.pan,
            bankuser:this.state.bankuser,
            bankname:this.state.bankname,
            accnumber:this.state.accnumber,
            ifsc:this.state.ifsc
        };
        const formData = new FormData();
        var filename = this.props.user.id;
        formData.append('selfie',this.state.selfie);
        formData.append('filename',filename);
        this.props.updateUserDetails(userData,formData,config); // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
        
        }
    }

    render() {
        const { otp, numInputs, separator, isDisabled, hasErrored, isInputNum } = this.state;
        return (
        <React.Fragment>
            <h3>Profile Details</h3>
            <p style={{fontWeight:'700',marginTop:'8px'}}>{this.state.referralId !== '' && 'Your Referral ID is '+this.state.referralId}</p>
            <hr></hr>
            <form onSubmit={this.handleSubmit}>
            <div className="row">
            <div className="col-md-4" style={{
                    maxHeight: "150px",
                    overflow: "hidden",
                    maxWidth: "150px",
                    height: "auto",
                    width: "150px",
                    marginBottom: "15px",
            }}>
                <img src={this.state.imagePath} width='150px' />
            </div>
            <div className="col-md-4">
            <div className="wrapper">
            <label htmlFor="selfie" className="font-weight-bold">Upload Selfie with Date</label> 
            {/* <span className="required">*</span> */}
            <div className="input-group mb-3">
            <input type="file" id="selfie" name="selfie" className="form-control" aria-describedby="basic-addon3" onChange={this.handleFileChange}/>
            </div>                
            </div>
            </div>
            </div>
            <div className="row">
                <div className="col-md-4">
                <div className="wrapper">
                <label htmlFor="firstname" className="font-weight-bold">First Name <span className="required">*</span></label>
                <div className="input-group mb-3">
                <input type="text" id="firstname" className="form-control" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.firstname} />
                </div>                
                </div>
                <div className="wrapper">
                <label htmlFor="mobile" className="font-weight-bold">Mobile Number <span className="required">*</span></label>
                <div className="input-group mb-3">
                <input type="text" className="form-control" id="mobile" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.mobile} disabled/>
                </div>                
                </div>
                <div className="wrapper">
                <label htmlFor="pan" className="font-weight-bold">Pan</label>
                <div className="input-group mb-3">
                <input type="text" className="form-control" id="pan" aria-describedby="basic-addon3" onChange={this.handleChange} value={this.state.pan} />
                </div>                
                </div>
                </div>
                <div className="col-md-4">
                <div className="wrapper">
                <label htmlFor="lastname" className="font-weight-bold">Last Name <span className="required">*</span></label>
                <div className="input-group mb-3">
                <input type="text" className="form-control" id="lastname" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.lastname} />
                </div>                
                </div>
                <div className="wrapper">
                <label htmlFor="email" className="font-weight-bold">Email Id <span className="required">*</span></label>
                <div className="input-group mb-3">
                <input type="text" className="form-control" id="email" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.email} />
                </div>                
                </div>
                </div>
            </div>
                <hr className="mt-3" />
                <h3 className="pb-3">Address</h3>
                <div className="row">
                <div className="col-md-4">
                <div className="wrapper">
                <label htmlFor="streetaddress" className="font-weight-bold">Street Address </label>
                <div className="input-group mb-3">
                <input type="text" className="form-control" id="streetaddress" aria-describedby="basic-addon3" onChange={this.handleChange} value={this.state.streetaddress} />
                </div>                
                </div>
                <div className="wrapper">
                <label htmlFor="city" className="font-weight-bold">City <span className="required">*</span></label>
                <div className="input-group mb-3">
                <input type="text" className="form-control" id="city" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.city} />
                </div>                
                </div>
                </div>
                <div className="col-md-4">
                <div className="wrapper">
                <label htmlFor="state" className="font-weight-bold">State <span className="required">*</span></label>
                <div className="input-group mb-3">
                <input type="text" className="form-control" id="state" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.state} />
                </div>                
                </div>
                <div className="wrapper">
                <label htmlFor="pincode" className="font-weight-bold">Pincode <span className="required">*</span></label>
                <div className="input-group mb-3">
                <input type="number" className="form-control" id="pincode" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.pincode} />
                </div>                
                </div>
                </div>
                </div>
            <hr className="mt-3" />
                <h3 className="pb-3">Bank Account Details</h3>
            <div className="row">
                <div className="col-md-4">
                <div className="wrapper">
                    <label htmlFor="bankuser" className="font-weight-bold">Account Holder Name</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" id="bankuser" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.bankuser} />
                    </div>                
                </div>
                <div className="wrapper">
                    <label htmlFor="accnumber" className="font-weight-bold">Account Number</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" id="accnumber" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.accnumber} />
                    </div>                
                </div>
                </div>
                <div className="col-md-4">
                <div className="wrapper">
                    <label htmlFor="bankname" className="font-weight-bold">Bank Name</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" id="bankname" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.bankname} />
                    </div>                
                </div>
                <div className="wrapper">
                    <label htmlFor="confAccNum" className="font-weight-bold">Confirm Account Number</label>
                    <div className="input-group mb-3">
                        <input type="password" name="confAccNum" className="form-control" id="confAccNum" aria-describedby="basic-addon3" required autoComplete="off" onChange={this.handleChange} value={this.state.confAccNum} />
                        <p className='error-danger color-danger'>{this.state.AccErr}</p>
                    </div>                
                </div>
                </div>
            </div>
            <div class="row">
                <div className="col-md-4">
                <div className="wrapper">
                    <label htmlFor="ifsc" className="font-weight-bold">IFSC Code</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" id="ifsc" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.ifsc} />
                    </div>                
                </div>
                </div>
            </div>
        <div className="row">
            <div className="container mt-3 text-center">
                <button className="btn btn-primary ml-2 mr-2" style={{width: "140px"}} type="submit">Update</button>
            </div>
        </div>
        </form>
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
            <span id="otpNo" class="red-text"></span>
            <span id="otpYes" class="green-text text-green"></span>
            <p id="otpWrong" className="red-text"></p>
            <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.closeModal}>Close</button>
            <button type="button" className="btn btn-primary" onClick={this.checkOtp}>Submit</button>
            </div>
            </div>
            </div>
            </div>
        </React.Fragment>
        )
    }
}


userdetails.propTypes = {
    updateUserDetails: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
  };
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});
export default connect(
  mapStateToProps,
  { updateUserDetails }
)(withRouter(userdetails));