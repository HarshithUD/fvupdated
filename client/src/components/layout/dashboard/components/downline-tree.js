import React, { Component } from 'react'
import Sidebar from './sidebar'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import '../../../../view/css/downtree.css'
import Axios from 'axios';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'

class downtree extends Component {
    constructor(props){
        super(props);
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
        Axios.get('/api/users/getTree/'+userId).then(
            res => {
                Swal.close();
                this.setState({
                    userDetails:res.data
                })
            }
        )
    }

    render() {
        const { user } = this.props.auth;
        const userDataAll = this.state.userDetails
        return (
            <div className="page-wrapper chiller-theme toggled">
                <Sidebar user={user} />
                <main class="page-content">
                <div class="container-fluid">
                <div className="container-fluid" style={{ marginTop: "20px" }}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="tree">
                                <ul>
                                    <li>
                                        <Link to="">
                                            <div className="container-fluid">
                                                <div className="row">
                                                    Me
                                                </div>
                                            </div>
                                        </Link>
                                    {userDataAll.child1 && (
                                        <ul>
                                            <li>
                                                <Link to="">
                                                    <div className="container-fluid">
                                                        <div className="row">
                                                            {userDataAll.child1.name}
                                                        </div>
                                                    </div>
                                                </Link>
                                                {userDataAll.child1.child1 && (
                                                    <ul>
                                                        <li>
                                                            <Link to="">
                                                                <div className="container-fluid">
                                                                    <div className="row">
                                                                        {userDataAll.child1.child1.name}
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        </li>
                                                {userDataAll.child1.child2 && (
                                                        <li>
                                                            <Link to="">
                                                                <div className="container-fluid">
                                                                    <div className="row">
                                                                        {userDataAll.child1.child2.name}
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        </li>
                                                )}
                                                </ul>
                                                )}
                                            </li>
                                            {userDataAll.child2 && (
                                        <li>
                                            <Link to="">
                                                <div className="container-fluid">
                                                    <div className="row">
                                                        {userDataAll.child2.name}
                                                    </div>
                                                </div>
                                            </Link>
                                            {userDataAll.child2.child1 && (
                                                <ul>
                                                    <li>
                                                        <Link to="">
                                                            <div className="container-fluid">
                                                                <div className="row">
                                                                    {userDataAll.child2.child1.name}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </li>
                                            {userDataAll.child2.child2 && (
                                                    <li>
                                                        <Link to="">
                                                            <div className="container-fluid">
                                                                <div className="row">
                                                                    {userDataAll.child2.child2.name}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </li>
                                            )}
                                            </ul>
                                            )}
                                        </li>
                                    )}
                                        </ul>
                                    )}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                </main>
            </div>
        )
    }
}

downtree.propTypes = {
    auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
    auth: state.auth
});
export default connect(
    mapStateToProps,
    {}
)(downtree);