import React, { Component } from 'react'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Sidebar from './sidebar'
import Axios from 'axios';
import Swal from 'sweetalert2'
import { updateAdmin } from '../../../../actions/authActions'
import { withRouter } from "react-router-dom"

class settings extends Component {
    constructor(props){
        super(props);
        const userprops = this.props.admin.user;
        var sepName = userprops.name.split(" ")[0];
        this.state = {
            name: sepName,
            email: '',
            lvl1dep: '',    
            lvl1ser: '',
            lvl2dep: '',    
            lvl2ser: '',
            lvl3dep: '',    
            lvl3ser: '',
            lvl4dep: '',    
            lvl4ser: '',
            lvl5dep: '',    
            lvl5ser: '',
        }
    }

    componentDidMount(){
        Swal.fire({
            title: "Please Wait...",
            allowOutsideClick: false
		})
		Swal.showLoading();
        const userId = this.props.admin.user.id;
        Axios.get('/api/users/getAdminDetails/'+userId).then(
            res => {
                Swal.close();
                const resData = res.data;
                this.setState({
                    name:resData.name,
                    email:resData.email,
                    lvl1dep: resData.lvl1dep,
                    lvl1ser: resData.lvl1ser,
                    lvl2dep: resData.lvl2dep,
                    lvl2ser: resData.lvl2ser,
                    lvl3dep: resData.lvl3dep,
                    lvl3ser: resData.lvl3ser,
                    lvl4dep: resData.lvl4dep,
                    lvl4ser: resData.lvl4ser,
                    lvl5dep: resData.lvl5dep,
                    lvl5ser: resData.lvl5ser,
                })
            }
        )
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
        
        const adminData = {
            id: this.props.admin.user.id,
            name: this.state.name,
            email:this.state.email,
            lvl1dep:this.state.lvl1dep,
            lvl2dep:this.state.lvl2dep,
            lvl3dep:this.state.lvl3dep,
            lvl4dep:this.state.lvl4dep,
            lvl5dep:this.state.lvl5dep,
            lvl1ser:this.state.lvl1ser,
            lvl2ser:this.state.lvl2ser,
            lvl3ser:this.state.lvl3ser,
            lvl4ser:this.state.lvl4ser,
            lvl5ser:this.state.lvl5ser
        };
        Swal.fire({
            title: "Please Wait...",
            allowOutsideClick: false
          })
        Swal.showLoading();
        this.props.updateAdmin(adminData); // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
    }

    render() {
        const { user } = this.props.admin;
        return (
            <div className="page-wrapper chiller-theme toggled">
                <Sidebar adminDetails={user} />
                <main className="page-content">
			    <div className="container-fluid">
                <h3>Settings</h3>
                <hr></hr>
                <form onSubmit={this.handleSubmit}>
                <div className="row">
                    <div className="col-md-6">
                    <div className="wrapper">
                    <label htmlFor="name" className="font-weight-bold">Your Name <span className="required">*</span></label>
                    <div className="input-group mb-3">
                    <input type="text" id="name" className="form-control" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.name} />
                    </div>                
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="wrapper">
                    <label htmlFor="email" className="font-weight-bold">Email Address<span className="required">*</span></label>
                    <div className="input-group mb-3">
                    <input type="text" className="form-control" id="email" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.email} />
                    </div>                
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="wrapper">
                    <label htmlFor="lvl1dep" className="font-weight-bold">Level 1 Deposit amount <span className="required">*</span></label>
                    <div className="input-group mb-3">
                    <input type="number" className="form-control" id="lvl1dep" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.lvl1dep} />
                    </div>                
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="wrapper">
                    <label htmlFor="lvl1ser" className="font-weight-bold">Level 1 Company charges<span className="required">*</span></label>
                    <div className="input-group mb-3">
                    <input type="number" className="form-control" id="lvl1ser" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.lvl1ser} />
                    </div>                
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="wrapper">
                    <label htmlFor="lvl2dep" className="font-weight-bold">Level 2 Deposit amount <span className="required">*</span></label>
                    <div className="input-group mb-3">
                    <input type="number" className="form-control" id="lvl2dep" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.lvl2dep} />
                    </div>                
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="wrapper">
                    <label htmlFor="lvl2ser" className="font-weight-bold">Level 2 Company charges<span className="required">*</span></label>
                    <div className="input-group mb-3">
                    <input type="number" className="form-control" id="lvl2ser" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.lvl2ser} />
                    </div>                
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="wrapper">
                    <label htmlFor="lvl3dep" className="font-weight-bold">Level 3 Deposit amount <span className="required">*</span></label>
                    <div className="input-group mb-3">
                    <input type="number" className="form-control" id="lvl3dep" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.lvl3dep} />
                    </div>                
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="wrapper">
                    <label htmlFor="lvl3ser" className="font-weight-bold">Level 3 Company charges<span className="required">*</span></label>
                    <div className="input-group mb-3">
                    <input type="number" className="form-control" id="lvl3ser" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.lvl3ser} />
                    </div>                
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="wrapper">
                    <label htmlFor="lvl4dep" className="font-weight-bold">Level 4 Deposit amount <span className="required">*</span></label>
                    <div className="input-group mb-3">
                    <input type="number" className="form-control" id="lvl4dep" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.lvl4dep} />
                    </div>                
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="wrapper">
                    <label htmlFor="lvl4ser" className="font-weight-bold">Level 4 Company charges<span className="required">*</span></label>
                    <div className="input-group mb-3">
                    <input type="number" className="form-control" id="lvl4ser" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.lvl4ser} />
                    </div>                
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="wrapper">
                    <label htmlFor="lvl5dep" className="font-weight-bold">Level 5 Deposit amount <span className="required">*</span></label>
                    <div className="input-group mb-3">
                    <input type="number" className="form-control" id="lvl5dep" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.lvl5dep} />
                    </div>                
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="wrapper">
                    <label htmlFor="lvl5ser" className="font-weight-bold">Level 5 Company charges<span className="required">*</span></label>
                    <div className="input-group mb-3">
                    <input type="number" className="form-control" id="lvl5ser" aria-describedby="basic-addon3" required onChange={this.handleChange} value={this.state.lvl5ser} />
                    </div>                
                    </div>
                    </div>
                    </div>
                    <div className="row">
                        <div className="container mt-3 text-center">
                            <button className="btn btn-secondary ml-3 mr-2" style={{width: "140px"}} >Cancel</button>
                            <button className="btn btn-primary ml-2 mr-2" style={{width: "140px"}} type="submit">Update</button>
                        </div>
                    </div>
                </form>
                </div>
                </main>
            </div>
        )
    }
}

settings.propTypes = {
    admin: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
admin: state.auth
});
export default connect(
mapStateToProps,
{ updateAdmin }
)(withRouter(settings));