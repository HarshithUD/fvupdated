import React, { Component } from 'react'
import Sidebar from './sidebar'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import '../../../../view/css/downtree.css';
import Swal from 'sweetalert2';
import Axios from 'axios';

class AdmindownTree extends Component {
    constructor(props){
        super(props)
        this.state = {
            userDetails: []
        }
    }

    componentDidMount(){
        Swal.fire({
            title: "Please Wait...",
            allowOutsideClick: false
        })
        Swal.showLoading();
        const userId = this.props.auth.user.id;
        Axios.get('/api/users/getAllTree/').then(
            res => {
                Swal.close();
                this.setState({
                    userDetails:res.data
                })
                console.log(this.state.userDetails)
            }
        )
    }

    render() {
        const { user } = this.props.auth;
        return (
            <React.Fragment>
                <div className="page-wrapper chiller-theme toggled">
                <Sidebar adminDetails={user} />
                <main className="page-content">
                    <div className="container-fluid">
                    <h3>User Tree</h3>
                    <div className="container-fluid" style={{ marginTop: "20px" }}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="tree">
                                <ul>
                                    <li>
                                        <a>
                                            <div className="container-fluid">
                                                <div className="row">
                                                    XYZ
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    </div>
                    </div>
                </main>
                </div>
            </React.Fragment>
        )
    }
}

AdmindownTree.propTypes = {
    auth: PropTypes.object.isRequired
  };
  const mapStateToProps = state => ({
    auth: state.auth
  });
  export default connect(
    mapStateToProps,
    { }
)(AdmindownTree);