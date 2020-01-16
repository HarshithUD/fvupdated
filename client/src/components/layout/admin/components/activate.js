import React,{ Component } from 'react';
import { MDBDataTable } from 'mdbreact';
import 'mdbreact/dist/css/mdb.css';
import axios from 'axios'
import Swal from 'sweetalert2'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Sidebar from './sidebar'
import { CSVLink } from "react-csv";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class toApprove extends Component{
    constructor(props){
        super(props);
        this.state = {
            userDetail:[],
            username:'',
            startDate: '',
            toDate: new Date(),
            dateerror:''
        }

        this.updateTable = this.updateTable.bind(this);
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


    viewDetails = (user) => {
        Swal.fire({
            title: 'User Details',
            html: 
            "<div class='container'>" +
            "<img src="+user.img+" width='150px' />" +
            "<h4>"+user.name+"</h4>" +
            "<h6>"+user.number+"</h6>" +
            "<h6>"+user.email+"</h6>" +
            "<table class='table table-bordered table-hover table-striped'>" +
            "<tbody>" +
                "<tr>" +
                "<td>Address</td>" +
                "<td>"+user.address+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>PAN number</td>" +
                "<td>"+user.pan+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Account holder name</td>" +
                "<td>"+user.bankuser+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Account number</td>" +
                "<td>"+user.accnumber+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Bank Name</td>" +
                "<td>"+user.bankname+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>IFSC</td>" +
                "<td>"+user.ifsc+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Status</td>" +
                "<td>"+user.active+"</td>" +
                "</tr>" +
            "</tbody>"+
            "</table>" +
            "</div>",
            showCancelButton: true,
            showLoaderOnConfirm: true,
            confirmButtonColor: '#00c851',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Activate user',
            preConfirm: async (approve) => {
                return await axios.get('/api/users/activate/'+user._id)
            }
          }).then((result) => {
            if (result.value) {
              Swal.fire(
                'Activated!',
                'User has been activated.',
                'success'
              ).then(() => {
                Swal.fire({
                  title: "Please Wait...",
                  allowOutsideClick: false
                })
                Swal.showLoading();
                this.updateTable();
              }
              )
            }
          })
    }

    activateUser = (user) => {
      Swal.fire({
        title: "Please Wait...",
        allowOutsideClick: false
      })
      Swal.showLoading();
        axios.get('/api/users/activate/'+user._id).then(
            result => {
                if(result){
                  Swal.close();
                    Swal.fire(
                        'Activated!',
                        'User has been activated.',
                        'success'
                    ).then(() => {
                      Swal.fire({
                        title: "Please Wait...",
                        allowOutsideClick: false
                      })
                      Swal.showLoading();
                      this.updateTable();
                    }
                    )
                }
                else{
                    alert("Failed")
                }
            }
        )
    }

    declineUser = (user) => {
        Swal.fire({
          title: "Please Wait...",
          allowOutsideClick: false
        })
        Swal.showLoading();
        axios.delete('/api/users/decline/'+user._id).then(
          result => {
            if(result.data === true){
              Swal.close()
              Swal.fire(
                'User Declined',
                'User has been Declined',
                'success'
              ).then(() => {
                Swal.fire({
                  title: "Please Wait...",
                  allowOutsideClick: false
                })
                Swal.showLoading();
                this.updateTable();
              })
            }
          }
        )
    }

render() {
    let data =  {
        columns: [
            {
                label: '#',
                field: 'slno',
                sort: 'asc'
            },
            {
                label: 'Name',
                field: 'name',
                sort: 'asc'
            },
            {
                label: 'Email',
                field: 'email',
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
            if(!data1.active && !data1.all.declined && (dateAt >= this.state.startDate) && (dateAt <= this.state.toDate)){
            return resultData[index] = {
                slno:++count,
                name:data1.name,
                email:data1.email,
                date:data1.date,
                action:<div><button type="button" className="btn btn-primary" onClick={() => this.viewDetails(data1.all)}>View Details</button>
                <button type="button" className="btn btn-success" onClick={() => this.activateUser(data1.all)}>Activate</button>
                <button type="button" className="btn btn-danger" onClick={() => this.declineUser(data1.all)}>Decline</button>
                </div>
            }
        }
        })
        data.rows = resultData
    }
    const { user } = this.props.auth;
    let data2 = [
      ['User Id','Name','Email','Number','Date','Address','Pan']
    ];
    let data2arr = this.state.userDetail;
    data2arr.map((dataCsv,index) => {
      var dateAt2 = new Date(dataCsv.date);
      if(dataCsv.all.active === false && dataCsv.all.declined === false && (dateAt2 >= this.state.startDate) && (dateAt2 <= this.state.toDate)){
      let rsid = dataCsv.all._id;
      let rsname = dataCsv.all.name;
      let rsemail = dataCsv.all.email;
      let rsnumber = dataCsv.all.number;
      let rsdate = dataCsv.all.date;
      let rsaddress = dataCsv.all.address;
      let rspan = dataCsv.all.pan;
      data2.push([rsid,rsname,rsemail,rsnumber,rsdate,rsaddress,rspan])
    }
    })
    let dateNow = new Date();
    let dateFormat = dateNow.getDate()+'-'+dateNow.getMonth()+'-'+dateNow.getFullYear();
    let filename = "Activate_users_list_"+dateFormat+".csv";
  return (
    <div className="page-wrapper chiller-theme toggled">
      <Sidebar adminDetails={user} />
      <main className="page-content">
      <div className="container-fluid">
      <h3>Activate Users</h3>
      <hr></hr>
      <div class="exportCsv">
      <CSVLink data={data2} filename={filename} ><button type="button" className="btn btn-primary" >Export to CSV</button></CSVLink>
      </div>
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
    />
    </div>
    </main>
    </div>
  );
}
}

toApprove.propTypes = {
    auth: PropTypes.object.isRequired
  };
  const mapStateToProps = state => ({
    auth: state.auth
  });
  export default connect(
    mapStateToProps,
    { }
)(toApprove);