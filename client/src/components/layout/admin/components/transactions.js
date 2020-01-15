import React, { Component } from 'react'
import axios from 'axios';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Swal from 'sweetalert2'
import Sidebar from './sidebar'
import { MDBDataTable } from 'mdbreact';
import 'mdbreact/dist/css/mdb.css';
import {Link} from 'react-router-dom'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class transactions extends Component {
    constructor(props){
        super(props);
        this.state = {
            userDetail:[],
            startDate: '',
            toDate: new Date(),
            dateerror:''
        }
    }

    componentDidMount(){
        Swal.fire({
          title: "Please Wait...",
          allowOutsideClick: false
        })
        Swal.showLoading();
        this.updateTable();
    }

    updateTable = () => {
        axios.get('/api/users/admin/getUsers').then(
        res => {
            Swal.close();
            var usersData = res.data;
            this.setState({
                userDetail: usersData
            })
        }
    )
    }

    updateFilter = () => {
        if(this.state.startDate > this.state.toDate){
          this.setState({
            dateerror: 'Error! Start date should be less than To Date'
          })
        }
        else{
          this.setState({
            dateerror:''
          })
        }
      }
  
      handleChangeDate = date => {
        this.setState({
          startDate: date
        });
      };
  
      handleChangeToDate = date => {
        this.setState({
          toDate: date
        });
      };
  
    
    render() {
        let data =  {
            columns: [
                {
                    label: '#',
                    field: 'slno',
                    sort: 'asc'
                },
                {
                    label: 'userid',
                    field: 'userid',
                    sort: 'asc'
                },
                {
                    label: 'Name',
                    field: 'name',
                    sort: 'asc'
                },
                {
                    label: 'Date',
                    field: 'date',
                    sort: 'asc'
                },
                {
                    label: 'Action',
                    field: 'action',
                    sort: 'asc'
                },
            ],
            rows: [
               {
                }
            ]
        }
        let resultData = [];
        if(this.state.userDetail.length>0){
            let arr1 = this.state.userDetail;
            var count = 0;
            arr1.map((data1,index) => {
                var dateAt = new Date(data1.date);
                if(!data1.all.declined && data1.action && (dateAt >= this.state.startDate) && (dateAt <= this.state.toDate)){
                return resultData[index] = {
                    slno:++count,
                    userid:data1.all._id,
                    name:data1.all.name,
                    email:data1.email,
                    date:data1.date,
                    action:<div><Link to={'/admin/transaction-detail?id='+data1.all._id} className="btn btn-primary">View Details</Link>
                    </div>
                }
            }
            })
            data.rows = resultData
        }
        const { user } = this.props.auth;
        return (
            <React.Fragment>
                <div className="page-wrapper chiller-theme toggled">
                    <Sidebar adminDetails={user} />
                    <main className="page-content">
                    <div className="container-fluid">
                    <h3>Transaction Details</h3>
                    <hr></hr>
                    <div>
      From: <DatePicker
        selected={this.state.startDate}
        onChange={this.handleChangeDate}
        dateFormat="dd/MM/yyyy"
        placeholderText="DD/MM/YYYY"
        onCalendarClose={this.updateFilter}
      />
      To: <DatePicker
        selected={this.state.toDate}
        onChange={this.handleChangeToDate}
        placeholderText="DD/MM/YYYY"
        dateFormat="dd/MM/yyyy"
        onCalendarClose={this.updateFilter}
      />
      <p className="red-text">{this.state.dateerror}</p>
      </div>
                    <MDBDataTable
                        striped
                        bordered
                        hover
                        data={data}
                        exportCSV 
                    />
                    </div>
                    </main>
                </div>
            </React.Fragment>
        )
    }
}

transactions.propTypes = {
    auth: PropTypes.object.isRequired
  };
  const mapStateToProps = state => ({
    auth: state.auth
  });
  export default connect(
    mapStateToProps,
    { }
)(transactions);