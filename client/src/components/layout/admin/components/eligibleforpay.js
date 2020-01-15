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

class eliblePayout extends Component{
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
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Approve user',
            preConfirm: async (approve) => {
                return await axios.get('/api/queue/approve/'+user._id)
            }
          }).then((result) => {
            if (result.data) {
              Swal.fire(
                'Approved!',
                'User has been added to the Queue.',
                'success'
              )
            }
          })
    }

    acceptPay = (user) => {
      let userid = user._id;
      if(user.payout.eligible > 0){
        Swal.fire({
            title: 'Amount Eligibled for Payout',
			inputAttributes: {
			autocapitalize: 'off'
			},
            showCancelButton: true,
            html:
              '<h4 style="color:green;font-weight:700">Rs. '+user.payout.eligible+'</h4><p><label for="a1">Mode of transfer: </label><input class="form-control" id="a1" type="text" name="a1" /></p><p><label for="a2">Transaction ID: </label><input id="a2" name="a2" class="form-control" type="text" /></p>',
            confirmButtonText: 'Transfer',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
				var mode_values = [];
				mode_values = [
				  document.getElementById('a1').value,
				  document.getElementById('a2').value
				];
				var mode_values1 = mode_values[0].replace(/[^a-zA-Z0-9]/g, '');
				var mode_values2 = mode_values[1].replace(/[^a-zA-Z0-9]/g, '');
               return await axios.get('/api/users/acceptPay/'+userid+'@!'+user.payout.eligible+'@!'+mode_values1+'@!'+mode_values2)
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
          }).then(async (result) => {
              console.log(result)
            if (result.value) {
              Swal.fire(
                'Done!',
                'Money has been deposited.',
                'success'
              )
              Swal.fire({
                title: "Please Wait...",
                allowOutsideClick: false
              })
            Swal.showLoading();
            this.updateTable();
            }
          })
        }
        else{
          Swal.fire(
            'Payout is lesser than 0',
            '',
            'error'
          )
        }
    }

    approveUser = (user) => {
      Swal.fire({
        title: "Please Wait...",
        allowOutsideClick: false
      })
      Swal.showLoading();
        axios.get('/api/queue/approve/'+user._id).then(
            result => {
                if(result){
                  Swal.close();
                    Swal.fire(
                        'Approved!',
                        'User has been added to the Queue.',
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
                label: 'Eligible amt',
                field: 'eligibleamt',
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
            if((data1.action) && (data1.active) && ((data1.all.payout.eligible)>0) && (dateAt >= this.state.startDate) && (dateAt <= this.state.toDate) ){
            return resultData[index] = {
                slno:++count,
                name:data1.name,
                email:data1.email,
                date:data1.date,
                eligibleamt:'Rs. '+data1.all.payout.eligible,
                action:<div><button type="button" className="btn btn-primary" onClick={() => this.acceptPay(data1.all)}>Deposit</button>
                {/* <button type="button" className="btn btn-success" onClick={() => this.approveUser(data1.all)}>Approve</button> */}
                {/* <button type="button" className="btn btn-danger" onClick={() => this.depositMoney(data1.all)}>Deposit</button> */}
                </div>
            }
        }
        })
        data.rows = resultData
    }
    const { user } = this.props.auth;
    let data2 = [
      ['Name','Email','Number','Address','Pan']
    ];
    let data2arr = this.state.userDetail;
    data2arr.map((dataCsv,index) => {
      var dateAt2 = new Date(dataCsv.date);
      if((dateAt2 >= this.state.startDate) && (dateAt2 <= this.state.toDate)){
      let rsname = dataCsv.all.name;
      let rsemail = dataCsv.all.email;
      let rsnumber = dataCsv.all.number;
      let rsaddress = dataCsv.all.address;
      let rspan = dataCsv.all.pan;
      data2.push([rsname,rsemail,rsnumber,rsaddress,rspan])
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
      <h3>Eligible for Payment</h3>
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

eliblePayout.propTypes = {
    auth: PropTypes.object.isRequired
  };
  const mapStateToProps = state => ({
    auth: state.auth
  });
  export default connect(
    mapStateToProps,
    { }
)(eliblePayout);