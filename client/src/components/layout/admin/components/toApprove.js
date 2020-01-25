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

    viewDetails = (user) => {
      let useraddress = 'Not Updated';
      if(typeof user.address !== 'undefined'){
        useraddress = "<li><b>Street Address:</b>"+user.address.streetaddress+"</li>"+
        "<li><b>State:</b>"+user.address.state+"</li>"+
        "<li><b>City:</b>"+user.address.city+"</li>"+
        "<li><b>Pincode:</b>"+user.address.pincode+"</li>"
      }
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
                "<td><ul style='list-style:none;padding:0;margin:0;text-align: left;'>" +
                useraddress +
                "</ul></td>" +
                "</tr>" +
                "<tr>" +
                "<td>Referral Id</td>" +
                "<td>"+user.referralId+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Referrer</td>" +
                "<td>"+user.referrer+"</td>" +
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
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Approve user',
            preConfirm: async (approve) => {
              if(!(user.bankname === '' || user.bankuser === '' || user.ifsc === '' || user.accnumber === '' || user.bankname === undefined || user.bankuser === undefined || user.ifsc === undefined || user.accnumber === undefined)){
                return await axios.get('/api/queue/approve/'+user._id);
              }
            }
          }).then((result) => {
            console.log(result)
            if(typeof result.value !=='undefined' && typeof result.value.data === 'undefined'){
              Swal.fire(
                'Details pending from the user!',
                '',
                'warning'
              )
            }
            else if (result.value && result.value.data) {
              Swal.fire(
                'Approved!',
                'User has been added to the Queue.',
                'success'
              ).then(()=>{
                Swal.fire({
                  title: "Please Wait...",
                  allowOutsideClick: false
                })
                Swal.showLoading();
                this.updateTable();
              })
            }
          })
    }

    approveUser = (user) => {
      Swal.fire({
        title: "Please Wait...",
        allowOutsideClick: false
      })
      Swal.showLoading();
      if(user.bankname === '' || user.bankuser === '' || user.ifsc === '' || user.accnumber === '' || user.bankname === undefined || user.bankuser === undefined || user.ifsc === undefined || user.accnumber === undefined){
        Swal.close();
        Swal.fire(
          'Details pending from the user!',
          '',
          'warning'
        )
      }
        else{
          axios.get('/api/queue/approve/'+user._id).then(
            result => {
                if(result.data.error){
                  Swal.close();
                    Swal.fire(
                        'Error!',
                        result.data.message,
                        'error'
                    )
                }
                else{
                  Swal.fire(
                    'Success',
                    result.data.message,
                    'success'
                  )
                  Swal.fire({
                    title: "Please Wait...",
                    allowOutsideClick: false
                  })
                  Swal.showLoading();
                  this.updateTable();
                }
            }
        )
          }
    }

    // approveAll = async () => {
    //   var x = this.state.userDetail;
    //   for(let i=0;i<x.length;i++){
    //     var xxxx = await this.approveUser(x[i].all);
    //     console.log(xxxx)
    //   }
    // }

    depositMoney = (user) => {
        Swal.fire({
            title: 'Enter the amount to deposit',
            input: 'number',
            inputAttributes: {
              autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Deposit',
            showLoaderOnConfirm: true,
            preConfirm: async (login) => {
                console.log(login)
              return await axios.get('/api/users/deposit/'+user._id+'@'+login)
                .then(response => {
                  if (!response.data) {
                    throw new Error(response.statusText)
                  }
                  return response.data
                })
                .catch(error => {
                  Swal.showValidationMessage(
                    `Request failed: ${error}`
                  )
                })
            },
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
              console.log(result)
            if (result.value) {
              Swal.fire(
                'Done!',
                'Money has been deposited.',
                'success'
              )
            }
          })
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
            if(!data1.all.declined && !data1.action && data1.active && (dateAt >= this.state.startDate) && (dateAt <= this.state.toDate)){
            return resultData[index] = {
                slno:++count,
                name:data1.name,
                email:data1.email,
                date:data1.date,
                action:<div><button type="button" className="btn btn-primary" onClick={() => this.viewDetails(data1.all)}>View Details</button>
                <button type="button" className="btn btn-success" onClick={() => this.approveUser(data1.all)}>Approve</button>
                <button type="button" className="btn btn-danger" onClick={() => this.declineUser(data1.all)}>Decline</button>
                </div>
            }
        }
        })
        data.rows = resultData
    }
    const { user } = this.props.auth;
    let data2 = [
      ['userid','Date','Name','Email','Number','Street address','State','city','Pincode','Pan','Bank Name','Account holder Name','Account Number','IFSC']
    ];
    let data2arr = this.state.userDetail;
    data2arr.map((dataCsv,index) => {
      var dateAt2 = new Date(dataCsv.date);
      if(!dataCsv.all.declined && !dataCsv.all.action && dataCsv.all.active && (dateAt2 >= this.state.startDate) && (dateAt2 <= this.state.toDate)){
      let rsname = dataCsv.all.name;
      let rsid = dataCsv.all._id;
      let rsdate = dataCsv.all.date;
      let rsemail = dataCsv.all.email;
      let rsnumber = dataCsv.all.number;
      let rsstreet = dataCsv.all.address && dataCsv.all.address.streetaddress;
      let rsstate = dataCsv.all.address && dataCsv.all.address.state;
      let rscity = dataCsv.all.address && dataCsv.all.address.city;
      let rspincode = dataCsv.all.address && dataCsv.all.address.pincode;
      let rspan = dataCsv.all.pan;
      let rsbankname = dataCsv.all.bankname;
      let rsbankuser = dataCsv.all.bankuser;
      let rsaccnumber = dataCsv.all.accnumber;
      let rsifsc = dataCsv.all.ifsc;
      data2.push([rsid,rsdate,rsname,rsemail,rsnumber,rsstreet,rsstate,rscity,rspincode,rspan,rsbankname,rsbankuser,rsaccnumber,rsifsc])
    }
    })
    let dateNow = new Date();
    let dateFormat = dateNow.getDate()+'-'+dateNow.getMonth()+'-'+dateNow.getFullYear();
    let filename = "Approve_users_list_"+dateFormat+".csv";
  return (
    <div className="page-wrapper chiller-theme toggled">
      <Sidebar adminDetails={user} />
      <main className="page-content">
      <div className="container-fluid">
      <h3>Approve Users</h3>
      {/* <button type="button" className="btn btn-danger" onClick={() => this.approveAll()}>Approve All</button> */}
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